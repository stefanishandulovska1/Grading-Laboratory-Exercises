import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Search, Plus, Edit, Trash2, Download,
    Users, BookOpen, Award, BarChart3
} from 'lucide-react';
import apiService from '../services/api';
import { API_BASE } from '../services/api';

const AssignmentManagementSystem = () => {
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [importResults, setImportResults] = useState([]);
    const [showImportModal, setShowImportModal] = useState(false);


    const showNotification = (type, message) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 5000);
    };
    const [activeTab, setActiveTab] = useState('subjects');
    const [subjects, setSubjects] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [users, setUsers] = useState([]);
    const { user, logout } = useAuth();

    const professors = users.filter(u => u.role === 'НАСТАВНИК');
    const assistants = users.filter(u => u.role === 'АСИСТЕНТ');

    const [userAssignments, setUserAssignments] = useState([]);
    const [loading, setLoading] = useState(false);

    const [studentSubmissions, setStudentSubmissions] = useState([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
    const [submissionComment, setSubmissionComment] = useState('');
    const [submissionFile, setSubmissionFile] = useState(null);
    const [professorSubmissions, setProfessorSubmissions] = useState([]);
    const [gradingData, setGradingData] = useState({});

    const [subjectForm, setSubjectForm] = useState({
        code: '',
        name: '',
        semester: '',
        year: 1,
        professor: '',
        assistantIds: []
    });

    const [assignmentForm, setAssignmentForm] = useState({
        title: '',
        description: '',
        points: '1',
        requirements: '',
        subjectId: '',
        dueDate: '',
    });

    const [userForm, setUserForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'СТУДЕНТ',
        indexNumber: ''
    });

    const [editingItem, setEditingItem] = useState(null);
    const [searchTerms, setSearchTerms] = useState({
        subjects: '',
        assignments: '',
        users: ''
    });

    const subjectFormRef = useRef(null);
    const assignmentFormRef = useRef(null);
    const userFormRef = useRef(null);

    const handleUsersImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            showNotification('error', 'Немате овластување за импортирање на корисници');
            return;
        }


        const validExtensions = ['.csv', '.xlsx', '.xls'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

        if (!validExtensions.includes(fileExtension)) {
            showNotification('error', 'Невалиден формат на датотека. Дозволени се CSV, XLSX и XLS.');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('file', file);

            const result = await apiService.importUsers(formData);

            setImportResults(result);
            setShowImportModal(true);

            if (result.length === 0 || result.every(msg => msg.includes('успешно') || msg.includes('Success'))) {
                showNotification('success', 'Корисниците се успешно импортирани!');

            } else {
                showNotification('warning', 'Импортирањето е завршено со некои грешки. Проверете ги резултатите.');
            }
        } catch (error) {
            console.error('Import failed:', error);
            showNotification('error', 'Грешка при импортирање: ' + (error.message || 'Непозната грешка'));
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };
    const handleStudentsImport = async (subjectId, e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('file', file);

            const result = await apiService.importStudentsToSubject(subjectId, formData);

            setImportResults(result);
            setShowImportModal(true);

            if (result.every(msg => msg.includes('успешно') || msg.includes('Success') || msg.includes('веќе'))) {
                showNotification('success', 'Студентите се успешно импортирани на предметот!');
            } else {
                showNotification('warning', 'Импортирањето е завршено со некои грешки. Проверете ги резултатите.');
            }
        } catch (error) {
            console.error('Import failed:', error);
            showNotification('error', 'Грешка при импортирање: ' + (error.message || 'Непозната грешка'));
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };


    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const data = await apiService.getSubjects();
            setSubjects(data);
        } catch {
            showNotification('error', 'Грешка при вчитување предмети');
        } finally {
            setLoading(false);
        }
    };
    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const data = await apiService.getAssignments();
            setAssignments(data);
        } catch {
            showNotification('error', 'Грешка при вчитување задачи');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await apiService.getUsers();
            setUsers(data);
        } catch {
            showNotification('error', 'Грешка при вчитување корисници');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserAssignments = async () => {
        try {
            const data = await apiService.getUserAssignments();
            setUserAssignments(data);
        } catch {
            showNotification('error', 'Грешка при вчитување оценки');
        }
    };
    useEffect(() => {

        if (!showImportModal && importResults.length > 0) {
            fetchUsers();
            fetchSubjects();
            fetchAssignments();


            setImportResults([]);
        }
    }, [showImportModal, importResults]);
    useEffect(() => {
        fetchSubjects();
        fetchAssignments();
        fetchUsers();
        fetchUserAssignments();
    }, []);


    useEffect(() => {
        if (user?.role === 'СТУДЕНТ' && user?.id) {
            apiService.getSubmissionsByStudent(user.id)
                .then(data => {
                    console.log('Loaded submissions:', data);
                    setStudentSubmissions(data);
                })
                .catch(error => {
                    console.error('Error loading submissions:', error);
                });
        }
    }, [user]);


    const fetchSubmissionsForAssignment = async (assignmentId) => {
        try {
            const subs = await apiService.getSubmissionsByAssignment(assignmentId);
            setProfessorSubmissions(subs);
            setSelectedAssignmentId(assignmentId);
        } catch {
            alert('Грешка при вчитување на поднесувања');
        }
    };


    const handleSubjectSubmit = async (e) => {
        e.preventDefault();
        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            showNotification('error', 'Немате овластување да додавате или уредувате предмети');
            return;
        }
        try {
            setLoading(true);
            if (editingItem) {
                await apiService.updateSubject(editingItem, subjectForm);
                showNotification('success', 'Предметот е успешно ажуриран!');
            } else {
                await apiService.createSubject(subjectForm);
                showNotification('success', 'Предметот е успешно додаден!');
            }
            setSubjectForm({ code: '', name: '', semester: '', year: 1, professor: '', assistant: '' });
            setEditingItem(null);
            fetchSubjects();
        } catch {
            showNotification('error', 'Грешка при зачувување предмет');
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectEdit = (subject) => {
        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            showNotification('error', 'Немате овластување да уредувате предмети');
            return;
        }
        setSubjectForm({
            code: subject.code || '',
            name: subject.name || '',
            semester: subject.semester || '',
            year: subject.year || 1,
            professor: subject.professor || '',
            assistant: subject.assistant || ''
        });
        setEditingItem(subject.id);
        if (subjectFormRef.current) subjectFormRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubjectDelete = async (id) => {
        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            showNotification('error', 'Немате овластување да бришете предмети');
            return;
        }
        if (!window.confirm('Дали сте сигурни дека сакате да избришете предмет?')) return;
        try {
            setLoading(true);
            await apiService.deleteSubject(id);
            showNotification('success', 'Предметот е успешно избришен!');
            fetchSubjects();
        } catch {
            showNotification('error', 'Грешка при бришење предмет');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignmentSubmit = async (e) => {
        e.preventDefault();
        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            showNotification('error', 'Немате овластување да додавате или уредувате задачи');
            return;
        }

        try {
            setLoading(true);
            const data = {
                title: assignmentForm.title,
                description: assignmentForm.description,
                points: parseInt(assignmentForm.points) || 1,
                requirements: assignmentForm.requirements || '',
                subjectId: parseInt(assignmentForm.subjectId),
                ...(assignmentForm.dueDate && { dueDate: assignmentForm.dueDate })
            };

            if (editingItem) {
                await apiService.updateAssignment(editingItem, data);
                showNotification('success', 'Задачата е успешно ажурирана!');
            } else {
                await apiService.createAssignment(data);
                showNotification('success', 'Задачата е успешно додадена!');
            }

            setAssignmentForm({ title: '', description: '', points: '1', requirements: '', subjectId: '', dueDate: '' });
            setEditingItem(null);
            fetchAssignments();

        } catch (error) {
            console.error('Error saving assignment:', error);
            showNotification('error', 'Грешка при зачувување задача: ' + (error.message || 'Непозната грешка'));
        } finally {
            setLoading(false);
        }
    };

    const handleAssignmentDelete = async (id) => {
        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            showNotification('error', 'Немате овластување да бришете задачи');
            return;
        }
        if (!window.confirm('Дали сте сигурни дека сакате да избришете задача?')) return;
        try {
            setLoading(true);
            await apiService.deleteAssignment(id);
            showNotification('success', 'Задачата е успешно избришена!');
            fetchAssignments();
        } catch {
            showNotification('error', 'Грешка при бришење задача');
        } finally {
            setLoading(false);
        }
    };


    const handleAssignmentEdit = (assignment) => {
        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            showNotification('error', 'Немате овластување да уредувате задачи');
            return;
        }
        setAssignmentForm(assignment);
        setEditingItem(assignment.id);
        if (assignmentFormRef.current) assignmentFormRef.current.scrollIntoView({ behavior: 'smooth' });
    };




    const handleUserSubmit = async (e) => {
        e.preventDefault();
        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            showNotification('error', 'Немате овластување да додавате или уредувате корисници');
            return;
        }
        try {
            setLoading(true);
            if (editingItem) {
                console.log('Updating user with data:', userForm);
                await apiService.updateUser(editingItem, userForm);
                showNotification('success', 'Корисникот е успешно ажуриран!');
            } else {
                const toSend = {
                    firstName: userForm.firstName,
                    lastName: userForm.lastName,
                    email: userForm.email,
                    role: userForm.role,
                    indexNumber: userForm.role === 'СТУДЕНТ' ? userForm.indexNumber : null
                };
                console.log("Payload being sent to /users:", toSend);
                await apiService.createUser(toSend);
                showNotification('success', 'Корисникот е успешно додаден!');
            }
            setUserForm({ firstName: '', lastName: '', email: '', role: 'СТУДЕНТ', indexNumber: '' });
            setEditingItem(null);
            fetchUsers();
        } catch (error){
            console.error('Error saving user:', error);
            showNotification('error', 'Грешка при зачувување корисник: ' + (error.message || 'Непозната грешка'));
        } finally {
            setLoading(false);
        }
    };

    const handleUserDelete = async (id) => {
        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            showNotification('error', 'Немате овластување да бришете корисници');
            return;
        }
        if (!window.confirm('Дали сте сигурни дека сакате да избришете корисник?')) return;

        try {
            setLoading(true);
            await apiService.deleteUser(id);
            showNotification('success', 'Корисникот е успешно избришен!');
            setUsers(prevUsers => prevUsers.filter(u => u.id !== id));
        } catch (error) {
            if (error.message.includes('404')) {
                showNotification('warning', 'Корисникот не е пронајден или е веќе избришан');

                setUsers(prevUsers => prevUsers.filter(u => u.id !== id));
            } else {
                showNotification('error', 'Грешка при бришење корисник');
            }
        } finally {
            setLoading(false);
             await fetchUsers();
        }
    };


    const handleUserEdit = (userData) => {
        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            showNotification('error', 'Немате овластување да уредувате корисници');
            return;
        }
        setUserForm(userData);
        setEditingItem(userData.id);
        if (userFormRef.current) userFormRef.current.scrollIntoView({ behavior: 'smooth' });
    };





    const SubmissionsModal = ({ submissions, assignment, onClose, onGrade , downloadFile}) => {
        const [grades, setGrades] = useState({});
        const [modalOpen, setModalOpen] = useState(false);
        const [selectedSubmission, setSelectedSubmission] = useState(null);


        useEffect(() => {

            const initialGrades = {};
            submissions.forEach(sub => {
                initialGrades[sub.id] = sub.grade || '';
            });
            setGrades(initialGrades);
        }, [submissions]);

        const handleGradeSubmit = async (submissionId) => {
            const grade = grades[submissionId];
            if (!grade || grade < 1 || grade > 100) {
                showNotification('error', 'Внесете валидна оценка (1-100)');
                return;
            }

            try {
                await apiService.gradeSubmission(submissionId, parseInt(grade));
                showNotification('success', 'Оценката е успешно зачувана!');
                onClose();
            } catch (error) {
                console.error('Error grading:', error);
                showNotification('error', 'Грешка при оценување');
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-11/12 max-w-4xl max-h-[80vh] overflow-y-auto">
                    <h3 className="text-xl font-bold mb-4">
                        Поднесувања за: {assignment.title}
                    </h3>

                    {submissions.length === 0 ? (
                        <p className="text-gray-500">Нема поднесувања за оваа задача.</p>
                    ) : (
                        <div className="space-y-4">
                            {submissions.map(sub => (
                                <div
                                    key={sub.id}
                                    className="border p-4 rounded flex justify-between items-center cursor-pointer hover:bg-blue-50"
                                    onClick={() => {
                                        setSelectedSubmission(sub);
                                        setModalOpen(true);
                                    }}
                                >
                                    <div>
                                        <span className="font-semibold">{sub.studentFirstName} {sub.studentLastName}</span>
                                        <span className="text-gray-400 ml-2">({sub.studentIndexNumber})</span>
                                        <div className="text-sm text-blue-700">{assignment.title}</div>
                                    </div>
                                    <button
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                    >
                                        Детали / Оцени
                                    </button>
                                </div>
                            ))}
                            {modalOpen && selectedSubmission && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white p-6 rounded-lg w-full max-w-xl">
                                        <div className="mb-4">
                                            <h2 className="text-xl font-bold">
                                                {selectedSubmission.studentFirstName} {selectedSubmission.studentLastName} ({selectedSubmission.studentIndexNumber})
                                            </h2>
                                            <div className="text-gray-600">{assignment.title}</div>
                                            <div className="text-sm text-gray-600">
                                                Поднесено: {new Date(selectedSubmission.submittedAt).toLocaleString('mk-MK')}
                                            </div>
                                            {selectedSubmission.comments && (
                                                <div className="mt-2 text-sm">Коментар: {selectedSubmission.comments}</div>
                                            )}
                                            <button
                                                onClick={() => downloadFile(selectedSubmission.submissionFiles, selectedSubmission.id)}
                                                className="text-blue-600 hover:underline flex items-center cursor-pointer mt-2"
                                            >
                                                <Download size={16} className="mr-1" />
                                                Преземи поднесена датотека
                                            </button>
                                            {selectedSubmission.grade && (
                                                <div className="mt-2 text-green-600 font-semibold">
                                                    Веќе оценето: {selectedSubmission.grade}/100
                                                </div>
                                            )}
                                        </div>
                                        {!selectedSubmission.grade && (
                                            <div className="flex items-center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    value={grades[selectedSubmission.id] || ''}
                                                    onChange={e =>
                                                        setGrades(prev => ({
                                                            ...prev,
                                                            [selectedSubmission.id]: e.target.value
                                                        }))
                                                    }
                                                    className="w-20 p-2 border rounded mr-2"
                                                    placeholder="Оценк"
                                                />
                                                <button
                                                    onClick={() => handleGradeSubmit(selectedSubmission.id)}
                                                    className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                                                >
                                                    Оцени
                                                </button>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setModalOpen(false)}
                                            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                        >
                                            Затвори
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Затвори
                    </button>
                </div>
            </div>
        );
    };


    const handleSearch = async (type, term) => {
        if (!term.trim()) {
            if (type === 'subjects') fetchSubjects();
            if (type === 'assignments') fetchAssignments();
            if (type === 'users') fetchUsers();
            return;
        }
        try {
            if (type === 'subjects') setSubjects(await apiService.searchSubjects(term));
            if (type === 'assignments') setAssignments(await apiService.searchAssignments(term));
            if (type === 'users') setUsers(await apiService.searchUsers(term));
        } catch {
            showNotification('error', `Грешка при пребарување ${type}`);
        }
    };


    const exportToCSV = (data, filename) => {
        if (!data.length) return;
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj =>
            Object.values(obj).map(val =>
                typeof val === 'string' && val.includes(',') ? `"${val}"` : val
            ).join(',')
        );
        const BOM = "\uFEFF";
        const csv = BOM + [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const exportToJSON = (data, filename) => {
        if (!data.length) return;
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleFileUpload = async (assignmentId, file, comments) => {
        try {
            console.log('Uploading file for assignment:', assignmentId);
            console.log('File:', file);
            console.log('Comments:', comments);


            const result = await apiService.uploadSubmissionFile(
                assignmentId,
                user.id,
                file,
                comments
            );

            console.log('Upload result:', result);

            showNotification('success', 'Поднесувањето е успешно прикачено!');


            setLoading(true);
            const updatedSubs = await apiService.getSubmissionsByStudent(user.id);
            setStudentSubmissions(updatedSubs);
            await fetchAssignments();


            setSubmissionFile(null);
            setSubmissionComment('');

        } catch (error) {
            console.error('Upload failed:', error);
            console.error('Error details:', error.response?.data || error.message);
            showNotification('error', 'Грешка при прикачување: ' + (error.message || 'Непозната грешка'));
        } finally {
            setLoading(false);
        }
    };
    const downloadFile = async (filePath, submissionId) => {
        try {
            await apiService.downloadFile(
                `${API_BASE}/submissions/download/${submissionId}`,
                `submission_${submissionId}.pdf`
            );
        } catch (error) {
            console.error('Download error:', error);
            showNotification('error', 'Грешка при преземање на датотеката: ' + error.message);
        }
    };

    const getFilteredSubjects = () => {
        if (!searchTerms.subjects) return subjects;
        return subjects.filter(s =>
            (s.name && s.name.toLowerCase().includes(searchTerms.subjects.toLowerCase())) ||
            (s.code && s.code.toLowerCase().includes(searchTerms.subjects.toLowerCase())) ||
            (s.professor && s.professor.toLowerCase().includes(searchTerms.subjects.toLowerCase()))
        );
    };

    const getFilteredAssignments = () => {
        if (!searchTerms.assignments) return assignments;
        return assignments.filter(a =>
            (a.title && a.title.toLowerCase().includes(searchTerms.assignments.toLowerCase())) ||
            (a.description && a.description.toLowerCase().includes(searchTerms.assignments.toLowerCase()))
        );
    };

    const exportAssignmentResults = async (assignmentId) => {
        try {
            await apiService.exportAssignmentResults(assignmentId);
            showNotification('success', 'Резултатите за задачата се успешно експортирани!');
        } catch (error) {
            console.error('Export error:', error);
            showNotification('error', 'Грешка при експорт: ' + error.message);
        }
    };

    const getFilteredUsers = () => {
        if (!searchTerms.users) return users;
        return users.filter(u =>
            (u.firstName && u.firstName.toLowerCase().includes(searchTerms.users.toLowerCase())) ||
            (u.lastName && u.lastName.toLowerCase().includes(searchTerms.users.toLowerCase())) ||
            (u.email && u.email.toLowerCase().includes(searchTerms.users.toLowerCase())) ||
            (u.indexNumber && u.indexNumber.toLowerCase().includes(searchTerms.users.toLowerCase()))
        );
    };

    const LoadingSpinner = () => (
        <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <span className="ml-2 text-gray-600">Се вчитува...</span>
        </div>
    );
    const ImportResultsModal = ({ results, onClose }) => {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-11/12 max-w-4xl max-h-[80vh] overflow-y-auto">
                    <h3 className="text-xl font-bold mb-4">Резултати од импортирање</h3>

                    {results.length === 0 ? (
                        <p className="text-green-600">Сите студенти се успешно импортирани!</p>
                    ) : (
                        <div className="space-y-3">
                            {results.map((result, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded border ${
                                        result.includes('успешно') || result.includes('Success')
                                            ? 'bg-green-100 border-green-300 text-green-800'
                                            : 'bg-red-100 border-red-300 text-red-800'
                                    }`}
                                >
                                    {result}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Затвори
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
            {/* Notification - ADD THIS */}
            {notification.show && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
                    notification.type === 'success'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                }`}>
                    {notification.message}
                </div>
            )}
            <div className="container mx-auto px-4 pt-6 flex justify-end items-center">
                {user && user.role === 'СТУДЕНТ' && (
                    <span className="bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full px-4 py-2 text-base font-semibold shadow mr-2">
                        Индекс: {user.indexNumber || 'Нема внесен број'}
                    </span>
                )}
                {user && (
                    <button
                        onClick={logout}
                        className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 rounded-full px-5 py-2 text-base font-semibold shadow transition"
                    >
                        Одјави се
                    </button>
                )}
            </div>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 text-center">
                        <h1 className="text-4xl font-bold mb-2">Assignment Management System</h1>
                        <p className="text-blue-100">Систем за управување со задачи и проекти</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
                    <div className="flex bg-gray-50 border-b">
                        {[
                            { key: 'subjects', label: 'Предмети', icon: BookOpen },
                            { key: 'assignments', label: 'Задачи', icon: Award },
                            { key: 'users', label: 'Корисници', icon: Users },
                            { key: 'dashboard', label: 'Dashboard', icon: BarChart3 }
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                className={`flex-1 px-6 py-4 flex items-center justify-center space-x-2 font-medium transition-colors ${
                                    activeTab === key
                                        ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                onClick={() => setActiveTab(key)}
                                disabled={loading}
                            >
                                <Icon size={20} />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>

                    {loading && <LoadingSpinner />}

                    {/* SUBJECTS TAB */}
                    {!loading && activeTab === 'subjects' && (
                        <div className="p-8">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                                    <div className="text-3xl font-bold">{subjects.length}</div>
                                    <div>Вкупно Предмети</div>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                                    <div className="text-3xl font-bold">{new Date().getFullYear()}</div>
                                    <div>Тековна Година</div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                                    <div className="text-3xl font-bold">{assignments.length}</div>
                                    <div>Вкупно Задачи</div>
                                </div>
                            </div>
                            {/* Subject Form - samo staff */}
                            {['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role) && (
                                <div className="bg-gray-50 p-6 rounded-xl mb-8" ref={subjectFormRef}>
                                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                                        <Plus className="mr-2" />
                                        {editingItem ? 'Ажурирај предмет' : 'Додај предмет'}
                                    </h3>
                                    <form onSubmit={handleSubjectSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Код на предмет"
                                            value={subjectForm.code}
                                            onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })}
                                            required
                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />

                                        <input
                                            type="text"
                                            placeholder="Име на предмет"
                                            value={subjectForm.name}
                                            onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
                                            required
                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />

                                        <input
                                            type="text"
                                            placeholder="Семестар (e.g., 2024/1)"
                                            value={subjectForm.semester}
                                            onChange={e => setSubjectForm({ ...subjectForm, semester: e.target.value })}
                                            required
                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />

                                        <select
                                            value={subjectForm.year}
                                            onChange={e => setSubjectForm({ ...subjectForm, year: Number(e.target.value) })}
                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            {[1, 2, 3, 4].map(y => (
                                                <option key={y} value={y}>{y}. година</option>
                                            ))}
                                        </select>

                                        <select
                                            required
                                            value={subjectForm.professor}
                                            onChange={e => setSubjectForm({ ...subjectForm, professor: e.target.value })}
                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Избери професор</option>
                                            {professors.map(prof => (
                                                <option key={prof.id} value={`${prof.firstName} ${prof.lastName}`}>
                                                    {prof.firstName} {prof.lastName} ({prof.email})
                                                </option>
                                            ))}
                                        </select>

                                        <div className="md:col-span-3 flex flex-col">
                                            <label htmlFor="assistantIds" className="block text-sm font-medium text-gray-700 mb-2">
                                                Избери асистенти
                                            </label>
                                            <select
                                                id="assistantIds"
                                                multiple
                                                value={subjectForm.assistantIds}
                                                onChange={e => {
                                                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                                                    setSubjectForm({ ...subjectForm, assistantIds: selected });
                                                }}
                                                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                                            >
                                                {assistants.map(ast => (
                                                    <option key={ast.id} value={String(ast.id)}>
                                                        {ast.firstName} {ast.lastName} ({ast.email})
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => setSubjectForm({ ...subjectForm, assistantIds: [] })}
                                                className="mt-2 text-sm text-red-600 hover:underline self-start"
                                                tabIndex={-1}
                                            >
                                                Избриши избор
                                            </button>
                                        </div>

                                        <div className="flex space-x-2 md:col-span-3">
                                            <button type="submit" className="flex-1 bg-blue-500 text-white rounded-lg p-3 hover:bg-blue-600 transition">
                                                {editingItem ? 'Ажурирај' : 'Додај'}
                                            </button>
                                            {editingItem && (
                                                <button type="button" onClick={() => {
                                                    setEditingItem(null);
                                                    setSubjectForm({ code: '', name: '', semester: '', year: 1, professor: '', assistant: '' });
                                                }}
                                                        className="bg-gray-500 text-white rounded-lg p-3 hover:bg-gray-600 transition"
                                                >Откажи</button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            )}
                            {/* Search and Export */}
                            <div className="flex flex-wrap gap-4 mb-6">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-3" />
                                    <input
                                        placeholder="Пребарај предмети..."
                                        value={searchTerms.subjects}
                                        onChange={e => {
                                            setSearchTerms({ ...searchTerms, subjects: e.target.value });
                                            handleSearch('subjects', e.target.value);
                                        }}
                                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <button
                                    onClick={() => exportToCSV(subjects, 'predmeti')}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2"
                                >
                                    <Download size={16} /> <span>CSV</span>
                                </button>
                                <button
                                    onClick={() => exportToJSON(subjects, 'predmeti')}
                                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center space-x-2"
                                >
                                    <Download size={16} /> <span>JSON</span>
                                </button>
                                {['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role) && (
                                    <>
                                        <button
                                            onClick={() => exportToCSV(users.filter(u => u.role === 'СТУДЕНТ'), 'studenti')}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                        >Студенти CSV</button>
                                        <button
                                            onClick={() => exportToCSV(users.filter(u => u.role === 'НАСТАВНИК'), 'profesori')}
                                            className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800"
                                        >Професори CSV</button>
                                        <button
                                            onClick={() => exportToCSV(users.filter(u => u.role === 'АСИСТЕНТ'), 'asistenti')}
                                            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                                        >Асистенти CSV</button>
                                    </>
                                )}
                            </div>
                            {/* Subjects List */}
                            <div className="grid gap-4">
                                {getFilteredSubjects().map(subject => (
                                    <div key={subject.id} className="bg-white rounded shadow p-6 border-l-4 border-blue-500">
                                        <div className="flex justify-between mb-2">
                                            <div>
                                                <h3 className="text-xl font-semibold">{subject.name}</h3>
                                                <p className="text-blue-600 font-medium">{subject.code}</p>
                                            </div>
                                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">{subject.semester}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                            <div><b>Година:</b> {subject.year}</div>
                                            <div><b>Професор:</b> {subject.professor || 'Не е внесено'}</div>
                                            <div>
                                                <b>Асистенти:</b> {
                                                subject.assistants && subject.assistants.length > 0
                                                    ? subject.assistants.map(a => `${a.firstName} ${a.lastName}`).join(', ')
                                                    : 'Не е внесено'
                                            }
                                            </div>
                                            <div><b>Задачи:</b> {subject.assignmentCount || 0}</div>
                                        </div>
                                        <div className="flex space-x-2 mt-4">
                                            {['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role) && (
                                                <>
                                                    <button onClick={() => handleSubjectEdit(subject)} className="flex items-center bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 space-x-1">
                                                        <Edit size={16} /><span>Уреди</span>
                                                    </button>
                                                    <button onClick={() => handleSubjectDelete(subject.id)} className="flex items-center bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 space-x-1">
                                                        <Trash2 size={16} /><span>Избриши</span>
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            const students = await apiService.getStudentsForSubject(subject.id);
                                                            exportToCSV(students, `studenti_predmet_${subject.code}`);
                                                        }}
                                                        className="flex items-center bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 space-x-1"
                                                    >
                                                        <Download size={16} /><span>Студенти CSV</span>
                                                    </button>
                                                    <button
                                                        onClick={() => document.getElementById(`importStudents-${subject.id}`).click()}
                                                        className="flex items-center bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 space-x-1"
                                                    >
                                                        <Download size={16} /><span>Импортирај студенти</span>
                                                    </button>
                                                    <input
                                                        id={`importStudents-${subject.id}`}
                                                        type="file"
                                                        accept=".csv"
                                                        onChange={(e) => handleStudentsImport(subject.id, e)}
                                                        className="hidden"
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {getFilteredSubjects().length === 0 && (
                                    <div className="text-center py-8 text-gray-500">Нема предмети</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ASSIGNMENTS TAB */}
                    {!loading && activeTab === 'assignments' && (
                        <div className="p-8">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                                    <div className="text-3xl font-bold">{assignments.length}</div>
                                    <div>Вкупно Задачи</div>
                                </div>
                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl">
                                    <div className="text-3xl font-bold">{userAssignments.filter(ua => !ua.isGraded).length}</div>
                                    <div>Во Тек</div>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                                    <div className="text-3xl font-bold">{userAssignments.filter(ua => ua.isGraded).length}</div>
                                    <div>Завршени</div>
                                </div>
                            </div>
                            {/* Assignment Form - samo staff */}
                            {['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role) && (
                                <div className="bg-gray-50 p-6 rounded-xl mb-8" ref={assignmentFormRef}>
                                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                                        <Plus className="mr-2" />
                                        {editingItem ? 'Ажурирај задача' : 'Додај задача'}
                                    </h3>
                                    <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input type="text" placeholder="Наслов" value={assignmentForm.title}
                                                   onChange={e => setAssignmentForm({ ...assignmentForm, title: e.target.value })} required
                                                   className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                                            <input type="number" placeholder="Број поени" value={assignmentForm.points} min={1} max={100}
                                                   onChange={e => setAssignmentForm({ ...assignmentForm, points: e.target.value === '' ? '1' : e.target.value })} required
                                                   className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                                        </div>
                                        <textarea
                                            placeholder="Краток опис"
                                            value={assignmentForm.description}
                                            onChange={e => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            rows={3}
                                        />
                                        <textarea
                                            placeholder="Подетални барања"
                                            value={assignmentForm.requirements}
                                            onChange={e => setAssignmentForm({ ...assignmentForm, requirements: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            rows={4}
                                        />
                                        <input
                                            type="datetime-local"
                                            value={assignmentForm.dueDate || ''}
                                            onChange={e => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        />
                                        <select
                                            value={assignmentForm.subjectId}
                                            onChange={e => setAssignmentForm({ ...assignmentForm, subjectId: e.target.value })}
                                            required
                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Избери предмет</option>
                                            {subjects.map(s => (
                                                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                                            ))}
                                        </select>
                                        <div className="flex space-x-2">
                                            <button type="submit" className="flex-1 bg-purple-500 text-white rounded-lg p-3 hover:bg-purple-600">
                                                {editingItem ? 'Ажурирај' : 'Додај'}
                                            </button>
                                            {editingItem && (
                                                <button
                                                    type="button"
                                                    onClick={() => { setEditingItem(null); setAssignmentForm({ title: '', description: '', points: '1', requirements: '', subjectId: '', dueDate: '' }); }}
                                                    className="bg-gray-500 text-white rounded-lg p-3 hover:bg-gray-600"
                                                >Откажи</button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Search and export */}
                            <div className="flex flex-wrap gap-4 mb-6">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-3" />
                                    <input
                                        placeholder="Пребарај задачи..."
                                        value={searchTerms.assignments}
                                        onChange={e => {
                                            setSearchTerms({ ...searchTerms, assignments: e.target.value });
                                            handleSearch('assignments', e.target.value);
                                        }}
                                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <button onClick={() => exportToCSV(assignments, 'zadachi')} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2">
                                    <Download size={16} /> <span>CSV</span>
                                </button>
                                <button onClick={() => exportToJSON(assignments, 'zadachi')} className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center space-x-2">
                                    <Download size={16} /> <span>JSON</span>
                                </button>

                            </div>

                            {/* Assignments List */}
                            <div className="grid gap-4">
                                {getFilteredAssignments().map((assignment) => {
                                    const submission = studentSubmissions.find(s => {
                                        if (s.assignmentId) {
                                            return s.assignmentId === assignment.id;
                                        }
                                        if (s.assignment && s.assignment.id) {
                                            return s.assignment.id === assignment.id;
                                        }
                                        return false;
                                    });

                                    const dueDate = new Date(assignment.dueDate);
                                    const now = new Date();

                                    return (
                                        <div key={assignment.id} className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                                            {/* HEADER: Наслов, предмет и поени */}
                                            <div className="flex justify-between">
                                                <div>
                                                    <h4 className="text-xl font-bold text-purple-900">{assignment.title}</h4>
                                                    <div className="text-purple-800">{assignment.subjectCode} - {assignment.subjectName}</div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="bg-purple-200 px-3 py-1 rounded-full text-purple-800 text-sm font-bold mr-2">{assignment.points} поени</span>
                                                    {assignment.averageGrade && (
                                                        <span className="bg-green-100 px-3 py-1 rounded-full text-green-800 text-sm font-bold">
                            Поени: {assignment.averageGrade.toFixed(1)}
                        </span>
                                                    )}

                                                    {/* Копчиња за професори/асистенти */}
                                                    {(['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) && (
                                                        <div className="flex space-x-2 ml-4">
                                                            <button
                                                                onClick={() => handleAssignmentEdit(assignment)}
                                                                className="flex items-center bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 space-x-1"
                                                            >
                                                                <Edit size={16} />
                                                                <span>Уреди</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleAssignmentDelete(assignment.id)}
                                                                className="flex items-center bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 space-x-1"
                                                            >
                                                                <Trash2 size={16} />
                                                                <span>Избриши</span>
                                                            </button>
                                                            <button
                                                                onClick={() => exportAssignmentResults(assignment.id)}
                                                                className="flex items-center bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 space-x-1"
                                                            >
                                                                <Download size={16} />
                                                                <span>Export Results</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Опис и барања на задачата */}
                                            {assignment.description && <div className="mt-2">{assignment.description}</div>}
                                            {assignment.requirements && (
                                                <div className="mt-2 bg-gray-50 rounded p-3 text-sm">
                                                    <strong>Барања:</strong> {assignment.requirements}
                                                </div>
                                            )}

                                            {/* Краен рок */}
                                            <div className="text-sm text-gray-500 mt-2 mb-1">
                                                Краен рок: {dueDate.toLocaleString('mk-MK')}
                                            </div>

                                            {/* СТУДЕНТСКИ ДЕЛ - приказ и форма за поднесување */}
                                            {user?.role === "СТУДЕНТ" && (
                                                <>
                                                    {/* Display submission status and grade */}
                                                    {(() => {
                                                        const submission = studentSubmissions.find(s => {
                                                            if (s.assignmentId) return s.assignmentId === assignment.id;
                                                            if (s.assignment && s.assignment.id) return s.assignment.id === assignment.id;
                                                            return false;
                                                        });

                                                        return submission ? (
                                                            <div className={`mt-4 p-4 rounded-lg border-2 ${
                                                                submission.grade ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'
                                                            }`}>
                                                                <div className="font-semibold flex items-center">
                                                                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                                                    Статус на поднесување:
                                                                    <span className={submission.grade ? 'text-green-600 ml-2' : 'text-blue-600 ml-2'}>
                    {submission.grade ? ' ОЦЕНЕТО' : ' ПОДНЕСЕНО - НЕОЦЕНЕТО'}
                </span>
                                                                </div>

                                                                <div className="mt-3 text-sm text-gray-600">
                                                                    <strong>Време на поднесување:</strong> {new Date(submission.submittedAt).toLocaleString('mk-MK')}
                                                                </div>

                                                                {submission.grade && (
                                                                    <div className="mt-2 text-lg font-bold text-green-700">
                                                                        Ваша оценка: {submission.grade}/100
                                                                    </div>
                                                                )}

                                                                {submission.comments && (
                                                                    <div className="mt-2 text-sm text-gray-600">
                                                                        <strong>Ваши коментари:</strong> {submission.comments}
                                                                    </div>
                                                                )}

                                                                {submission.submissionFiles && (
                                                                    <div className="mt-3">
                                                                        <button
                                                                            onClick={() => downloadFile(submission.submissionFiles, submission.id)}
                                                                            className="text-blue-600 hover:underline flex items-center cursor-pointer"
                                                                        >
                                                                            <Download size={16} className="mr-1" />
                                                                            Преземи поднесена датотека
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {/* Show update message if before deadline */}
                                                                {now < dueDate && !submission.grade && (
                                                                    <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                                                                        Можете да ажурирате вашето поднесување додека не истече рокот.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            now >= dueDate && (
                                                                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-800">
                                                                    Рокот за поднесување е истечен. Немате поднесено решение.
                                                                </div>
                                                            )
                                                        );
                                                    })()}

                                                    {/* Upload/Update form - only show if before deadline */}
                                                    {now < dueDate && (
                                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                            <h4 className="font-semibold text-lg mb-3">
                                                                {submission ? 'Ажурирај го вашето поднесување' : 'Поднеси решение'}
                                                            </h4>

                                                            {/* Прикажи информации за постоечкото поднесување */}
                                                            {submission && (
                                                                <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                                                                    <h5 className="font-medium text-blue-800">Тековно поднесување:</h5>
                                                                    <p className="text-sm text-blue-700">
                                                                        Поднесено на: {new Date(submission.submittedAt).toLocaleString('mk-MK')}
                                                                    </p>
                                                                    {submission.comments && (
                                                                        <p className="text-sm text-blue-700 mt-1">
                                                                            <strong>Коментари:</strong> {submission.comments}
                                                                        </p>
                                                                    )}
                                                                    {submission.submissionFiles && (
                                                                        <div className="mt-2">
                                                                            <button
                                                                                onClick={() => downloadFile(submission.submissionFiles, submission.id)}
                                                                                className="text-blue-600 hover:underline flex items-center text-sm"
                                                                            >
                                                                                <Download size={14} className="mr-1" />
                                                                                Преземи тековната датотека
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Порака ако задачата е оценета */}
                                                            {submission?.grade && (
                                                                <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded text-red-800">
                                                                    ⚠️ Оваа задача е веќе оценета. Не можете да ја ажурирате.
                                                                </div>
                                                            )}

                                                            <form
                                                                onSubmit={async e => {
                                                                    e.preventDefault();

                                                                    if (submission?.grade) {
                                                                        showNotification('error', 'Не можете да ажурирате оценета задача');
                                                                        return;
                                                                    }

                                                                    if (!submissionFile && !submission) {
                                                                        showNotification('error', 'Ве молиме изберете PDF датотека');
                                                                        return;
                                                                    }
                                                                    if (submissionFile && submissionFile.type !== 'application/pdf') {
                                                                        showNotification('error', 'Само PDF датотеки се дозволени');
                                                                        return;
                                                                    }

                                                                    setLoading(true);
                                                                    try {
                                                                        await handleFileUpload(
                                                                            assignment.id,
                                                                            submissionFile,
                                                                            submissionComment
                                                                        );
                                                                    } catch (error) {
                                                                        console.error('Upload failed:', error);
                                                                        showNotification('error', 'Грешка при прикачување: ' + (error.message || 'Непозната грешка'));
                                                                    } finally {
                                                                        setLoading(false);
                                                                    }
                                                                }}
                                                                className="space-y-3"
                                                            >
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        {submission ? (
                                                                            <span className={submission.grade ? 'text-gray-500' : 'text-red-600'}>
                            {submission.grade ? 'Нова PDF датотека (ажурирањето не е дозволено за оценети задачи)' : 'Нова PDF датотека (задолжително за ажурирање)'}
                        </span>
                                                                        ) : 'PDF датотека'}
                                                                    </label>
                                                                    <input
                                                                        type="file"
                                                                        accept="application/pdf"
                                                                        onChange={e => setSubmissionFile(e.target.files[0])}
                                                                        className="block w-full p-2 border border-gray-300 rounded"
                                                                        required={!submission}
                                                                        disabled={submission?.grade}
                                                                    />
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {submission
                                                                            ? (submission.grade
                                                                                ? "Ажурирањето не е дозволено за оценети задачи"
                                                                                : "Изберете нова датотека за да ја замените постојната")
                                                                            : "Изберете PDF датотека за поднесување"
                                                                        }
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Коментари {submission && '(нови коментари ќе ги заменат постојните)'}
                                                                    </label>
                                                                    <textarea
                                                                        placeholder="Додадете коментари за вашето решение..."
                                                                        value={submissionComment}
                                                                        onChange={e => setSubmissionComment(e.target.value)}
                                                                        className="w-full p-2 border border-gray-300 rounded"
                                                                        rows={3}
                                                                        defaultValue={submission?.comments || ''}
                                                                        disabled={submission?.grade}
                                                                    />
                                                                </div>

                                                                <button
                                                                    type="submit"
                                                                    className="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
                                                                    disabled={loading || submission?.grade}
                                                                >
                                                                    {loading ? 'Се прикачува...' :
                                                                        (submission ?
                                                                            (submission.grade ? 'Оценето - не е дозволено ажурирање' : 'Ажурирај поднесување')
                                                                            : 'Поднеси решение')
                                                                    }
                                                                </button>

                                                                {submission && !submission.grade && (
                                                                    <p className="text-sm text-gray-500 mt-2">
                                                                        ⚠️ Внимание: Ажурирањето ќе ја замени постојната датотека и коментари.
                                                                    </p>
                                                                )}
                                                            </form>
                                                        </div>
                                                    )}

                                                    {/* Status messages */}
                                                    {now >= dueDate && submission && !submission.grade && (
                                                        <div className="mt-4 p-3 bg-orange-100 border border-orange-300 rounded text-orange-800">
                                                            Поднесувањето е завршено. Чекајте на оценување од професорот.
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {/* Копче за професори/асистенти да видат поднесувања */}
                                            {(['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) && (
                                                <button
                                                    onClick={() => fetchSubmissionsForAssignment(assignment.id)}
                                                    className="mt-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                >
                                                    Види поднесувања
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                                {getFilteredAssignments().length === 0 && (
                                    <div className="text-center text-gray-500 py-8">Нема задачи</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* USERS TAB */}
                    {!loading && activeTab === 'users' && (
                        <div className="p-8">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                                    <div className="text-3xl font-bold">{users.length}</div>
                                    <div>Вкупно Корисници</div>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                                    <div className="text-3xl font-bold">{users.filter(u => u.role === 'СТУДЕНТ').length}</div>
                                    <div>Студенти</div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                                    <div className="text-3xl font-bold">{users.filter(u => u.role === 'НАСТАВНИК' || u.role === 'АСИСТЕНТ').length}</div>
                                    <div>Наставници/Асистенти</div>
                                </div>
                            </div>
                            {/* User Form - samo staff */}
                            {['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role) && (
                                <div className="bg-gray-50 p-6 rounded-xl mb-8" ref={userFormRef}>
                                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                                        <Plus className="mr-2" />
                                        {editingItem ? 'Ажурирај корисник' : 'Додај корисник'}
                                    </h3>
                                    <form onSubmit={handleUserSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input type="text" placeholder="Име" value={userForm.firstName}
                                                   onChange={e => setUserForm({ ...userForm, firstName: e.target.value })}
                                                   required
                                                   className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                            <input type="text" placeholder="Презиме" value={userForm.lastName}
                                                   onChange={e => setUserForm({ ...userForm, lastName: e.target.value })}
                                                   required
                                                   className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={userForm.email}
                                            onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                                            required
                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <select
                                                value={userForm.role}
                                                onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                                                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="СТУДЕНТ">Студент</option>
                                                <option value="НАСТАВНИК">Наставник</option>
                                                <option value="АСИСТЕНТ">Асистент</option>
                                            </select>
                                            {userForm.role === 'СТУДЕНТ' && (
                                                <input
                                                    type="text"
                                                    placeholder="Број на индекс"
                                                    value={userForm.indexNumber}
                                                    onChange={e => setUserForm({ ...userForm, indexNumber: e.target.value })}
                                                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            )}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button type="submit" className="flex-1 bg-blue-500 text-white rounded-lg p-3 hover:bg-blue-600">
                                                {editingItem ? 'Ажурирај' : 'Додај'}
                                            </button>
                                            {editingItem && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingItem(null);
                                                        setUserForm({ firstName: '', lastName: '', email: '', role: 'СТУДЕНТ', indexNumber: '' });
                                                    }}
                                                    className="bg-gray-500 text-white rounded-lg p-3 hover:bg-gray-600"
                                                >Откажи</button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Search and Export */}

                            <div className="flex flex-wrap gap-4 mb-6">
                                {/* Existing search input */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-3" />
                                    <input
                                        placeholder="Пребарај корисници..."
                                        value={searchTerms.users}
                                        onChange={e => {
                                            setSearchTerms({ ...searchTerms, users: e.target.value });
                                            handleSearch('users', e.target.value);
                                        }}
                                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                {/* Existing export buttons */}
                                <button onClick={() => exportToCSV(users, 'korisnici')} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2">
                                    <Download size={16} /> <span>CSV</span>
                                </button>
                                <button onClick={() => exportToJSON(users, 'korisnici')} className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center space-x-2">
                                    <Download size={16} /> <span>JSON</span>
                                </button>

                                {/* NEW: Import button */}
                                <button
                                    onClick={() => document.getElementById('usersImportInput').click()}
                                    className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 flex items-center space-x-2"
                                    disabled={loading}
                                >
                                    <Download size={16} />
                                    <span>Импортирај корисници</span>
                                </button>

                                <input
                                    id="usersImportInput"
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleUsersImport}
                                    className="hidden"
                                    disabled={loading}
                                />

                                {/* Existing role-based export buttons */}
                                {['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role) && (
                                    <>
                                        <button onClick={() => exportToCSV(users.filter(u => u.role === 'СТУДЕНТ'), 'studenti')} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Студенти CSV</button>
                                        <button onClick={() => exportToCSV(users.filter(u => u.role === 'НАСТАВНИК'), 'profesori')} className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800">Професори CSV</button>
                                        <button onClick={() => exportToCSV(users.filter(u => u.role === 'АСИСТЕНТ'), 'asistenti')} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">Асистенти CSV</button>
                                    </>
                                )}
                            </div>
                            {/* List of users */}
                            <div className="grid gap-4">
                                {getFilteredUsers().map(u => (
                                    <div key={u.id} className="bg-white rounded shadow p-6 border-l-4 border-green-500">
                                        <div className="flex justify-between mb-2">
                                            <div>
                                                <h3 className="text-xl font-semibold">{u.firstName} {u.lastName}</h3>
                                                <p className="text-green-600 font-medium">{u.email}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-3 py-1 rounded text-white text-sm ${
                                                    u.role === 'СТУДЕНТ' ? 'bg-blue-500' :
                                                        u.role === 'НАСТАВНИК' ? 'bg-purple-500' :
                                                            'bg-orange-500'
                                                }`}>
                                                    {u.role}
                                                </span>
                                                {u.indexNumber && <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm">{u.indexNumber}</span>}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500 mb-4">
                                            Регистриран: {new Date(u.createdAt).toLocaleDateString('mk-MK')}
                                        </div>
                                        {['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role) && (
                                            <div className="flex space-x-2">
                                                <button onClick={() => handleUserEdit(u)} className="flex items-center bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 space-x-1"><Edit size={16} /><span>Уреди</span></button>
                                                <button onClick={() => handleUserDelete(u.id)} className="flex items-center bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600 space-x-1"><Trash2 size={16} /><span>Избриши</span></button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {getFilteredUsers().length === 0 && <div className="text-center text-gray-500 py-8">Нема корисници</div>}
                            </div>
                        </div>
                    )}

                    {/* DASHBOARD TAB */}
                    {!loading && activeTab === 'dashboard' && (
                        <div className="p-8">
                            <h2 className="text-2xl font-bold mb-8 flex items-center">
                                <BarChart3 className="mr-2" /> Dashboard & Analytics
                            </h2>
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded p-6">
                                    <div className="text-3xl font-bold">{subjects.length}</div>
                                    <div>Вкупно Предмети</div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded p-6">
                                    <div className="text-3xl font-bold">{assignments.length}</div>
                                    <div>Вкупно Задачи</div>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded p-6">
                                    <div className="text-3xl font-bold">{users.length}</div>
                                    <div>Вкупно Корисници</div>
                                </div>
                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded p-6">
                                    <div className="text-3xl font-bold">
                                        {userAssignments.length > 0
                                            ? (userAssignments.reduce((acc, val) => acc + (val.grade || 0), 0) / userAssignments.filter(ua => ua.grade !== null).length).toFixed(1)
                                            : '0.0'}
                                    </div>
                                    <div>Просек Оценка</div>
                                </div>
                            </div>
                            {/* More analytics... */}
                        </div>
                    )}
                </div>
                {selectedAssignmentId && (
                    <SubmissionsModal
                        submissions={professorSubmissions}
                        assignment={assignments.find(a => a.id === selectedAssignmentId)}
                        onClose={() => {
                            setSelectedAssignmentId(null);
                            setProfessorSubmissions([]);
                        }}
                        onGrade={() => {
                            fetchAssignments();
                            fetchUserAssignments();
                        }}
                        downloadFile={downloadFile}
                    />
                )}
                {}
                {showImportModal && (
                    <ImportResultsModal
                        results={importResults}
                        onClose={() => {
                            setShowImportModal(false);

                            fetchUsers();
                            fetchSubjects();
                            fetchAssignments();
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default AssignmentManagementSystem;
