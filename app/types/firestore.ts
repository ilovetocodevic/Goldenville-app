import { Timestamp } from 'firebase/firestore';

// Interface for User Profile (already partially defined in AuthContext, can be centralized here)
export interface UserProfile {
  uid: string;
  username: string;
  email: string; // Stored in lowercase
  role: 'student' | 'teacher' | 'admin' | string; // string for future flexibility
  classId?: string; // For students, links to Class.id
  subjects?: string[]; // For teachers (array of subject names or IDs)
  createdAt: Timestamp;
}

export interface SchoolClass {
  id: string; // e.g., 'year-7', 'year-8'
  name: string; // e.g., 'Year 7', 'Year 8'
  // Add other class-specific properties if any, e.g., description
}

export interface Subject {
  id: string; // e.g., 'math', 'phy'
  name: string; // e.g., 'Mathematics', 'Physics'
  // Add other subject-specific properties if any, e.g., description
}

export interface Note {
  id?: string; // Firestore document ID
  title: string;
  content: string; // Could be plain text, markdown, or HTML
  classId: string; // ID of the target SchoolClass
  subjectId: string; // ID of the relevant Subject
  createdBy: string; // UID of the teacher or admin
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Question {
  id: string; // Unique ID for the question within the test
  questionText: string;
  options: string[]; // Array of answer options
  correctAnswerIndex: number; // Index of the correct option in the options array
  // correctAnswer: string; // Alternative: store the correct answer text itself
}

export interface Test {
  id?: string; // Firestore document ID
  name: string;
  description?: string;
  classId: string; // ID of the target SchoolClass
  subjectId: string; // ID of the relevant Subject
  questions: Question[];
  deadline?: Timestamp; // Optional deadline
  createdBy: string; // UID of the teacher or admin
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  // duration?: number; // Optional: duration in minutes
}

// For student submissions/attempts
export interface ExamAttempt {
    id?: string; // Firestore document ID
    testId: string;
    studentId: string; // UID of the student
    answers: { questionId: string; selectedAnswerIndex: number }[]; // Array of student's answers
    score: number; // Calculated score
    totalQuestions: number;
    submittedAt: Timestamp;
    // classId?: string; // Denormalized for easier querying by class/teacher
    // subjectId?: string; // Denormalized for easier querying by class/teacher
}

// For results sent by Admin
export interface Result {
    id?: string; // Firestore document ID
    studentId: string;
    classId: string;
    subject: string; // Subject name or ID for which result is given
    marks?: number;
    grade?: string;
    comments?: string;
    sentBy: string; // Admin UID
    sentAt: Timestamp;
}

// For Announcements
export interface Announcement {
    id?: string; // Firestore document ID
    title: string;
    content: string;
    // targetRoles?: ('student' | 'teacher' | 'admin')[]; // Optional: if announcements can be targeted
    // targetClasses?: string[]; // Optional: if announcements can be targeted to specific classes
    createdBy: string; // Admin UID
    createdAt: Timestamp;
}
