
SET client_encoding = 'UTF8';

DROP TABLE IF EXISTS assignment_files CASCADE;
DROP TABLE IF EXISTS user_assignments CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS users CASCADE;


CREATE TABLE subjects (
                          id BIGSERIAL PRIMARY KEY,
                          code VARCHAR(20) NOT NULL UNIQUE,
                          name VARCHAR(255) NOT NULL,
                          semester VARCHAR(50) NOT NULL,
                          year INTEGER NOT NULL,
                          professor VARCHAR(255),
                          assistant VARCHAR(255),
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       first_name VARCHAR(100) NOT NULL,
                       last_name VARCHAR(100) NOT NULL,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       role VARCHAR(20) NOT NULL CHECK (role IN ('СТУДЕНТ', 'НАСТАВНИК', 'АСИСТЕНТ')),
                       index_number VARCHAR(20),
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE assignments (
                             id BIGSERIAL PRIMARY KEY,
                             title VARCHAR(255) NOT NULL,
                             description TEXT,
                             max_points INTEGER NOT NULL CHECK (max_points >= 1 AND max_points <= 100),
                             requirements TEXT,
                             subject_id BIGINT NOT NULL,
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE assignment_files (
                                  id BIGSERIAL PRIMARY KEY,
                                  file_name VARCHAR(255) NOT NULL,
                                  file_path VARCHAR(500) NOT NULL,
                                  file_type VARCHAR(100),
                                  file_size BIGINT,
                                  assignment_id BIGINT NOT NULL,
                                  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
);

CREATE TABLE user_assignments (
                                  id BIGSERIAL PRIMARY KEY,
                                  user_id BIGINT NOT NULL,
                                  assignment_id BIGINT NOT NULL,
                                  grade INTEGER CHECK (grade >= 0 AND grade <= 100),
                                  comments TEXT,
                                  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                  graded_at TIMESTAMP,
                                  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
                                  UNIQUE(user_id, assignment_id)
);


CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_subjects_semester ON subjects(semester);
CREATE INDEX idx_subjects_year ON subjects(year);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_index_number ON users(index_number);

CREATE INDEX idx_assignments_subject_id ON assignments(subject_id);
CREATE INDEX idx_assignments_title ON assignments(title);

CREATE INDEX idx_assignment_files_assignment_id ON assignment_files(assignment_id);

CREATE INDEX idx_user_assignments_user_id ON user_assignments(user_id);
CREATE INDEX idx_user_assignments_assignment_id ON user_assignments(assignment_id);
CREATE INDEX idx_user_assignments_grade ON user_assignments(grade);


CREATE OR REPLACE FUNCTION update_graded_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.grade IS NOT NULL AND OLD.grade IS NULL THEN
        NEW.graded_at = CURRENT_TIMESTAMP;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_graded_at
    BEFORE UPDATE ON user_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_graded_at();


INSERT INTO subjects (code, name, semester, year, professor, assistant) VALUES
                                                                            ('CS101', 'Програмирање 1', '2024/1', 1, 'Проф. д-р Марко Петровски', 'м-р Ана Николовска'),
                                                                            ('CS102', 'Структури на податоци', '2024/1', 2, 'Проф. д-р Елена Јовановска', 'м-р Стефан Димитров'),
                                                                            ('CS201', 'Бази на податоци', '2024/2', 2, 'Проф. д-р Владимир Стојанов', 'м-р Милена Тасевска'),
                                                                            ('CS301', 'Веб програмирање', '2024/1', 3, 'Проф. д-р Игор Младенов', 'м-р Дарко Николов'),
                                                                            ('CS401', 'Софтверско инженерство', '2024/2', 4, 'Проф. д-р Соња Ристовска', 'м-р Александар Стефанов');


INSERT INTO users (first_name, last_name, email, role, index_number) VALUES
-- Студенти
('Петар', 'Јованов', 'petar.jovanov@student.ukim.mk', 'СТУДЕНТ', '183042'),
('Марија', 'Стефанова', 'marija.stefanova@student.ukim.mk', 'СТУДЕНТ', '183043'),
('Никола', 'Димитров', 'nikola.dimitrov@student.ukim.mk', 'СТУДЕНТ', '183044'),
('Елена', 'Петковска', 'elena.petkovska@student.ukim.mk', 'СТУДЕНТ', '183045'),
('Дарко', 'Митревски', 'darko.mitrevski@student.ukim.mk', 'СТУДЕНТ', '183046'),

-- Наставници
('Марко', 'Петровски', 'marko.petrovski@finki.ukim.mk', 'НАСТАВНИК', NULL),
('Елена', 'Јовановска', 'elena.jovanovska@finki.ukim.mk', 'НАСТАВНИК', NULL),
('Владимир', 'Стојанов', 'vladimir.stojanov@finki.ukim.mk', 'НАСТАВНИК', NULL),

-- Асистенти
('Ана', 'Николовска', 'ana.nikolovska@finki.ukim.mk', 'АСИСТЕНТ', NULL),
('Стефан', 'Димитров', 'stefan.dimitrov@finki.ukim.mk', 'АСИСТЕНТ', NULL),
('Милена', 'Тасевска', 'milena.tasevska@finki.ukim.mk', 'АСИСТЕНТ', NULL);


INSERT INTO assignments (title, description, max_points, requirements, subject_id) VALUES
                                                                                   ('Лабораториска вежба 1', 'Основни концепти на програмирање', 15,
                                                                                    'Напишете програма која чита два броја и го печати нивниот збир, разлика, производ и количник.', 1),

                                                                                   ('Проект - Калкулатор', 'Имплементација на калкулатор со графички интерфејс', 30,
                                                                                    'Користејќи Java Swing, направете калкулатор кој поддржува основни аритметички операции.', 1),

                                                                                   ('Лабораториска вежба 2', 'Имплементација на листи и стекови', 20,
                                                                                    'Имплементирајте класи за едноврзани листи и стекови со основни операции.', 2),

                                                                                   ('Проект - База на податоци за библиотека', 'Дизајн и имплементација на база на податоци', 40,
                                                                                    'Создајте ER дијаграм и имплементирајте база на податоци за библиотечки систем.', 3),

                                                                                   ('Лабораториска вежба 3', 'HTML, CSS и JavaScript основи', 25,
                                                                                    'Направете веб страница со интерактивни елементи користејќи HTML, CSS и JavaScript.', 4),

                                                                                   ('Финален проект', 'Веб апликација за управување со задачи', 50,
                                                                                    'Развијте целосна веб апликација користејќи React и Spring Boot.', 4),

                                                                                   ('Анализа на барања', 'Документација за софтверски проект', 35,
                                                                                    'Подгответе целосна документација со анализа на барања, дизајн и план за имплементација.', 5);


INSERT INTO user_assignments (user_id, assignment_id, grade, comments, submitted_at, graded_at) VALUES

(1, 1, 14, 'Добра работа, мали проблеми со форматирање на излез.',
 CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(1, 2, 28, 'Одлична имплементација на графичкиот интерфејс.',
 CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),


(2, 1, 15, 'Перфектна работа!',
 CURRENT_TIMESTAMP - INTERVAL '9 days', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(2, 3, 18, 'Добра логика, мала грешка во delete операцијата.',
 CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),


(3, 1, 12, 'Работата е во ред, но треба подобрување на кодот.',
 CURRENT_TIMESTAMP - INTERVAL '11 days', CURRENT_TIMESTAMP - INTERVAL '9 days'),
(3, 2, 25, 'Добар интерфејс, но недостасуваат некои функции.',
 CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),

(4, 3, 19, 'Одлична имплементација на структурите на податоци.',
 CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(4, 5, 23, 'Креативен дизајн и добра функционалност.',
 CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),


(5, 1, 13, 'Основни барања се исполнети, треба подобрување.',
 CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(5, 4, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '2 days', NULL), -- Неоценет
(5, 5, 22, 'Добра работа со веб технологиите.',
 CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP);


CREATE VIEW subject_stats AS
SELECT
    s.id,
    s.code,
    s.name,
    s.semester,
    s.year,
    COUNT(a.id) as total_assignments,
    COUNT(ua.id) as total_submissions,
    COUNT(CASE WHEN ua.grade IS NOT NULL THEN 1 END) as graded_submissions,
    ROUND(AVG(ua.grade::numeric), 2) as average_grade
FROM subjects s
         LEFT JOIN assignments a ON s.id = a.subject_id
         LEFT JOIN user_assignments ua ON a.id = ua.assignment_id
GROUP BY s.id, s.code, s.name, s.semester, s.year;


CREATE VIEW student_stats AS
SELECT
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.index_number,
    COUNT(ua.id) as total_submissions,
    COUNT(CASE WHEN ua.grade IS NOT NULL THEN 1 END) as graded_submissions,
    ROUND(AVG(ua.grade::numeric), 2) as average_grade,
    SUM(CASE WHEN ua.grade IS NOT NULL THEN a.max_points ELSE 0 END) as total_points_earned,
    SUM(CASE WHEN ua.grade IS NOT NULL THEN a.max_points ELSE 0 END) as total_possible_points
FROM users u
         LEFT JOIN user_assignments ua ON u.id = ua.user_id
         LEFT JOIN assignments a ON ua.assignment_id = a.id
WHERE u.role = 'СТУДЕНТ'
GROUP BY u.id, u.first_name, u.last_name, u.email, u.index_number;


CREATE VIEW assignment_details AS
SELECT
    a.id,
    a.title,
    a.description,
    a.max_points,
    a.requirements,
    a.created_at,
    s.code as subject_code,
    s.name as subject_name,
    s.semester,
    COUNT(ua.id) as submission_count,
    COUNT(CASE WHEN ua.grade IS NOT NULL THEN 1 END) as graded_count,
    ROUND(AVG(ua.grade::numeric), 2) as average_grade,
    COUNT(af.id) as file_count
FROM assignments a
         JOIN subjects s ON a.subject_id = s.id
         LEFT JOIN user_assignments ua ON a.id = ua.assignment_id
         LEFT JOIN assignment_files af ON a.id = af.assignment_id
GROUP BY a.id, a.title, a.description, a.max_points, a.requirements, a.created_at,
         s.code, s.name, s.semester;


CREATE OR REPLACE FUNCTION get_student_assignments(student_id BIGINT)
RETURNS TABLE (
    assignment_id BIGINT,
    title VARCHAR(255),
    subject_code VARCHAR(20),
    subject_name VARCHAR(255),
    points INTEGER,
    submitted BOOLEAN,
    grade INTEGER,
    graded_at TIMESTAMP,
    comments TEXT
) AS $$
BEGIN
RETURN QUERY
SELECT
    a.id,
    a.title,
    s.code,
    s.name,
    a.points,
    (ua.id IS NOT NULL) as submitted,
    ua.grade,
    ua.graded_at,
    ua.comments
FROM assignments a
         JOIN subjects s ON a.subject_id = s.id
         LEFT JOIN user_assignments ua ON a.id = ua.assignment_id AND ua.user_id = student_id
ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_semester_stats(semester_name VARCHAR(50))
RETURNS TABLE (
    total_subjects BIGINT,
    total_assignments BIGINT,
    total_students BIGINT,
    total_submissions BIGINT,
    average_grade NUMERIC
) AS $$
BEGIN
RETURN QUERY
SELECT
    COUNT(DISTINCT s.id) as total_subjects,
    COUNT(DISTINCT a.id) as total_assignments,
    COUNT(DISTINCT CASE WHEN u.role = 'СТУДЕНТ' THEN u.id END) as total_students,
    COUNT(ua.id) as total_submissions,
    ROUND(AVG(ua.grade::numeric), 2) as average_grade
FROM subjects s
         LEFT JOIN assignments a ON s.id = a.subject_id
         LEFT JOIN user_assignments ua ON a.id = ua.assignment_id
         LEFT JOIN users u ON ua.user_id = u.id
WHERE s.semester = semester_name;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE audit_log (
                           id BIGSERIAL PRIMARY KEY,
                           table_name VARCHAR(50) NOT NULL,
                           operation VARCHAR(10) NOT NULL,
                           record_id BIGINT NOT NULL,
                           old_values JSONB,
                           new_values JSONB,
                           changed_by VARCHAR(255),
                           changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


COMMENT ON TABLE subjects IS 'Табела за чување на информации за предмети';
COMMENT ON TABLE users IS 'Табела за чување на информации за корисници (студенти, наставници, асистенти)';
COMMENT ON TABLE assignments IS 'Табела за чување на assignments/задачи за предмети';
COMMENT ON TABLE assignment_files IS 'Табела за чување на датотеки прикачени кон assignments';
COMMENT ON TABLE user_assignments IS 'Табела за врска помеѓу корисници и assignments со оценки';




SELECT 'Database initialization completed successfully!' as status;


SELECT 'Initial Data Statistics:' as info;
SELECT 'Subjects: ' || COUNT(*) FROM subjects;
SELECT 'Users: ' || COUNT(*) FROM users;
SELECT 'Assignments: ' || COUNT(*) FROM assignments;
SELECT 'User Assignments: ' || COUNT(*) FROM user_assignments;


SELECT 'Subject Statistics:' as info;
SELECT * FROM subject_stats ORDER BY code;