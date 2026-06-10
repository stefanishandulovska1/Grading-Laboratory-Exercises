
export const API_BASE = 'http://localhost:8081';

export const formatDate = (dateString) => {
    if (!dateString) return 'Не е внесено';

    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateString);
            return 'Невалиден датум';
        }


        if (date.getFullYear() < 1980) {
            console.error('Suspicious date (too old):', dateString, date);
            return 'Проблематичен датум';
        }

        return date.toLocaleDateString('mk-MK');
    } catch (error) {
        console.error('Error parsing date:', error);
        return 'Грешка во датум';
    }
};


export const formatDateTime = (dateString) => {
    if (!dateString) return 'Не е внесено';

    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime()) || date.getFullYear() < 1980) {
            return 'Проблематичен датум';
        }

        return date.toLocaleString('mk-MK');
    } catch (error) {
        console.error('Error parsing datetime:', error);
        return 'Грешка во датум';
    }
};

export const formatForDateTimeLocal = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';


        return date.toISOString().slice(0, 16);
    } catch (error) {
        return '';
    }
};


class ApiService {

    getAuthToken() {
        try {

            const token =
                localStorage.getItem('authToken') ||
                localStorage.getItem('token') ||
                sessionStorage.getItem('authToken') ||
                sessionStorage.getItem('token') ||
                '';

            console.log('Retrieved auth token:', token ? 'Found' : 'Not found');
            return token;
        } catch (error) {
            console.error('Error retrieving auth token:', error);
            return '';
        }
    }


    async downloadFile(url, defaultFilename) {
        try {
            const token = this.getAuthToken();
            console.log('Token for download:', token);

            if (!token) {

                if (typeof window === 'undefined') {
                    throw new Error('Not in browser environment');
                }


                console.log('LocalStorage authToken:', localStorage.getItem('authToken'));
                console.log('LocalStorage token:', localStorage.getItem('token'));
                console.log('SessionStorage authToken:', sessionStorage.getItem('authToken'));
                console.log('SessionStorage token:', sessionStorage.getItem('token'));

                throw new Error('Authentication token missing. Please log in again.');
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {

                if (response.status === 401) {

                    this.handleAuthError();
                    throw new Error('Session expired. Please log in again.');
                }

                const errorText = await response.text();
                throw new Error(`Download failed: ${response.status} - ${errorText}`);
            }

            const blob = await response.blob();


            if (blob.size === 0) {
                throw new Error('Received empty file');
            }

            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;


            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = defaultFilename;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);

            return { success: true, filename };
        } catch (error) {
            console.error('Download error:', error);


            if (error.message.includes('401') || error.message.includes('expired')) {
                error.message = 'Session expired. Please log in again.';
            } else if (error.message.includes('404')) {
                error.message = 'File not found.';
            } else if (error.message.includes('500')) {
                error.message = 'Server error occurred during download. Please try again.';
            }

            throw error;
        }
    }
    async importUsers(formData) {
        const token = this.getAuthToken();
        const response = await fetch(`${API_BASE}/csv/import/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Import failed');
        }

        return response.json();
    }

    async exportUsersToCSV() {
        try {
            const token = this.getAuthToken();
            const response = await fetch(`${API_BASE}/csv/export/users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Export failed: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;


            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'users_export.csv';

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error('Export users error:', error);
            throw error;
        }
    }


    async importStudentsToSubject(subjectId, formData) {
        try {
            const token = this.getAuthToken();
            const response = await fetch(`${API_BASE}/subjects/${subjectId}/import-students`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,

                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Import failed');
            }

            return response.json();
        } catch (error) {
            console.error('Import students error:', error);
            throw error;
        }
    }



    async exportAssignmentResults(assignmentId) {

        if (!assignmentId || isNaN(assignmentId) || assignmentId <= 0) {
            throw new Error('Invalid assignment ID');
        }

        console.log(`Attempting to export results for assignment ID: ${assignmentId}`);

        return this.downloadFile(
            `${API_BASE}/csv/export/assignment/${assignmentId}/results`,
            `assignment_${assignmentId}_results.csv`
        );
    }


    async fetchWithErrorHandling(url, options = {}) {
        try {
            const token = this.getAuthToken();
            const headers = {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers,
            };

            const response = await fetch(url, { headers, ...options });

            if (!response.ok) {

                let errorText = await response.text();
                console.error('Server error response:', errorText);


                try {
                    const errorData = JSON.parse(errorText);
                    console.error('Parsed error data:', errorData);
                    throw new Error(`Validation errors: ${JSON.stringify(errorData)}`);
                } catch (e) {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }
            }


            if (response.status === 204) {
                return undefined;
            }


            const text = await response.text();
            if (!text) return undefined;

            return JSON.parse(text);
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }


    async login(email, password) {
        return this.fetchWithErrorHandling(`${API_BASE}/users/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(userObj) {
        return this.fetchWithErrorHandling(`${API_BASE}/users/register`, {
            method: 'POST',
            body: JSON.stringify(userObj),
        });
    }



    handleAuthError() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        sessionStorage.removeItem('authToken');
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }


    async getSubjects() {
        return this.fetchWithErrorHandling(`${API_BASE}/subjects`);
    }

    async createSubject(subjectData) {
        return this.fetchWithErrorHandling(`${API_BASE}/subjects`, {
            method: 'POST',
            body: JSON.stringify(subjectData),
        });
    }

    async updateSubject(id, subjectData) {
        return this.fetchWithErrorHandling(`${API_BASE}/subjects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(subjectData),
        });
    }

    async deleteSubject(id) {
        return this.fetchWithErrorHandling(`${API_BASE}/subjects/${id}`, {
            method: 'DELETE',
        });
    }

    async searchSubjects(term) {
        return this.fetchWithErrorHandling(`${API_BASE}/subjects/search?term=${encodeURIComponent(term)}`);
    }


    async getAssignments() {
        return this.fetchWithErrorHandling(`${API_BASE}/assignments`);
    }

    async createAssignment(assignmentData) {
        console.log('Sending assignment data to backend:', assignmentData);


        if (assignmentData.dueDate) {
            console.log('Due date format:', assignmentData.dueDate);
            console.log('Due date type:', typeof assignmentData.dueDate);
        }

        return this.fetchWithErrorHandling(`${API_BASE}/assignments`, {
            method: 'POST',
            body: JSON.stringify(assignmentData),
        });
    }

    async updateAssignment(id, assignmentData) {
        console.log('UPDATE Assignment - Sending:', assignmentData);
        console.log('DueDate being sent:', assignmentData.dueDate);
        console.log('DueDate type:', typeof assignmentData.dueDate);

        return this.fetchWithErrorHandling(`${API_BASE}/assignments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(assignmentData),
        });
    }

    async deleteAssignment(id) {
        return this.fetchWithErrorHandling(`${API_BASE}/assignments/${id}`, {
            method: 'DELETE',
        });
    }

    async searchAssignments(term) {
        return this.fetchWithErrorHandling(`${API_BASE}/assignments/search?term=${encodeURIComponent(term)}`);
    }


    async getUsers() {
        return this.fetchWithErrorHandling(`${API_BASE}/users`);
    }

    async createUser(userData) {
        return this.fetchWithErrorHandling(`${API_BASE}/users`, {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async updateUser(id, userData) {
        return this.fetchWithErrorHandling(`${API_BASE}/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }

    async deleteUser(id) {
        return this.fetchWithErrorHandling(`${API_BASE}/users/${id}`, {
            method: 'DELETE',
        });
    }

    async searchUsers(term) {
        return this.fetchWithErrorHandling(`${API_BASE}/users/search?term=${encodeURIComponent(term)}`);
    }

    async getStudentsForSubject(subjectId) {
        return this.fetchWithErrorHandling(`${API_BASE}/users/subject/${subjectId}/students`);
    }


    async getUserAssignments() {
        return this.fetchWithErrorHandling(`${API_BASE}/submissions`);
    }



    async uploadSubmissionFile(assignmentId, studentId, file, comments) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('comments', comments || '');

            const token = this.getAuthToken();

            const response = await fetch(`${API_BASE}/submissions/upload/${assignmentId}/student/${studentId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Грешка при прикачување на поднесување');
            }


            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                const text = await response.text();
                return { message: text, status: response.status };
            }

        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    async getSubmissionsByStudent(studentId) {
        return this.fetchWithErrorHandling(`${API_BASE}/submissions/student/${studentId}`);
    }

    async getSubmissionsByAssignment(assignmentId) {
        return this.fetchWithErrorHandling(`${API_BASE}/submissions/assignment/${assignmentId}`);
    }


    async gradeSubmission(submissionId, grade, comments = '') {
        try {
            const token = this.getAuthToken();


            const url = `${API_BASE}/submissions/${submissionId}/grade?grade=${grade}${
                comments ? `&comments=${encodeURIComponent(comments)}` : ''
            }`;

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,

                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Grading error response:', errorText);
                throw new Error(`Грешка при оценување: ${response.status}`);
            }

            if (response.status === 204) {
                return { success: true };
            }

            return await response.json();
        } catch (error) {
            console.error('Grading error:', error);
            throw error;
        }
    }
}

export default new ApiService();