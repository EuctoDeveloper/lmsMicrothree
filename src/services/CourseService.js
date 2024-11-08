import CourseCriteria from "../models/CourseCriteriaModel.js";
import Course from "../models/CourseModel.js";
import User from "../models/UserModel.js";
import CourseRepo from "../repositories/CourseRepo.js";

const CourseService = {
    getMyAvailableCourses: async (userData) => {
        const enrolledCourses = await CourseRepo.getEnrolledCourse(userData);
        const enrolledCourseIds = enrolledCourses.map((course) => course.courseId);
        const courseCriteria = CourseService.buildCourseCriteria(userData);
        const courses = await CourseRepo.getCourseByCourseCriteria(courseCriteria, enrolledCourseIds);
        return courses;
        
        // return the courses
    },
    getMyRecentCourses: async (userData, mode="recent") => {
        const getRecentCourses = await CourseRepo.getRecentCourses(userData);
        const recentCourseIds = getRecentCourses.map((course) => course.courseId);
        if((recentCourseIds && recentCourseIds.length < 6) || mode === "all") {
            const courseCriteria = CourseService.buildCourseCriteria(userData);
            const courses = await CourseRepo.getCourseByCourseCriteria(courseCriteria);
            console.log(recentCourseIds, courses.map((course) => course.courseId));
            for(let i = 0; i < courses.length; i++) {
                if(getRecentCourses.length === 6 && mode === "recent") {
                    break;
                }
                if(!recentCourseIds.includes(courses[i].courseId)) {
                    getRecentCourses.push({...courses[i], notEnrolled: true});
                }
            }
        }
        return getRecentCourses;
    },
    getMyEnrolledCourse: async (userData) => {
        const enrolledCourses = await CourseRepo.getEnrolledCourse(userData);
    },
    checkValidCourse: async (courseId, userData, toEnroll = false) => {
        const enrolledCourses = await CourseRepo.getEnrolledCourse(userData);
        const enrolledCourseIds = enrolledCourses.map((course) => course.courseId);
        if(toEnroll) {
            if(enrolledCourseIds.includes(parseInt(courseId))) {
                return false;
            }
        }
        let courseCriteria = CourseService.buildCourseCriteria(userData, enrolledCourseIds);
        courseCriteria = [
            ...courseCriteria,
            {courseId: parseInt(courseId)}
        ]
        let courses = await CourseRepo.getCourseByCourseCriteria(courseCriteria);
        if(courses && courses.length > 0) {
            return true;
        }
        return false;
    },
    getCourse: async (courseId, userId) => {
        const course = await CourseRepo.getCourseById(courseId, userId);
        return course;
    },
    getCourse2: async (courseId, userId) => {
        const course = await CourseRepo.getCourseById2(courseId, userId);
        return course;
    },
    getEnrolledModulesByCourseId: async (enrollmentId) => {
        const modules = await CourseRepo.getModulesByEnrolmentId(enrollmentId);
        return modules;
    },
    getEnrolledLessonsByModuleId: async (moduleId) => {
        const lessons = await CourseRepo.getEnrolledLessonsByModuleId(moduleId);
        return lessons;
    },
    getLesson: async (lessonId, userId) => {
        const lesson = await CourseRepo.getLessonById(lessonId, userId);
        return lesson;
    },
    saveLessonProgress: async (lessonId, user, lessonProgress) => {
        const progress = await CourseRepo.saveLessonProgress(lessonId, user, lessonProgress);
        return progress;
    },
    buildCourseCriteria: (userData, enrolledCourseIds) => {
        let courseCriteria = [
            {"courseCriteria.userRole": {$elemMatch: {$in: ["*", userData.role === 'customer' ? 'client' : 'employee']}},}
        ];
        if(userData.role === 'customer') {
            courseCriteria = [
                ...courseCriteria,
                {"courseCriteria.center": {$elemMatch: {$in: ['*',userData.centerId]}}},
                {"courseCriteria.group": {$elemMatch: {$in: ['*',userData.groupId]}}},
                {"courseCriteria.location": {$elemMatch: {$in: ['*',userData.locationId]}}},
            ]
        } else if(userData.role === "employee") {
            courseCriteria = [
                ...courseCriteria,
                {"courseCriteria.department": {$elemMatch: {$in: ['*',userData.departmentId]}}},
                {"courseCriteria.designation": {$elemMatch: {$in: ['*',userData.designationId]}}},
                {"courseCriteria.branch": {$elemMatch: {$in: ['*',userData.branchId]}}},
            ]
        }
        courseCriteria = [
            ...courseCriteria,
            // startDate: { $lte: new Date() },
            // endDate: { $gte: new Date() }
        ]
        return courseCriteria;
    },
    getCoursesByUser: async (userId) => {
        const userData = await User.findOne({userId});
        const courseCriteria = CourseService.buildCourseCriteria(userData);
        const courses = await CourseRepo.getCourseAndProgressByCourseCriteria(courseCriteria, userData.userId);
        return courses;
    },
    getUsersByCourse: async (courseId) => {
        const courseCriteria = await CourseCriteria.findOne({courseId});
        const users = await CourseRepo.getUsersByCourseCritria(courseCriteria, courseId);
        return users;
    },
    getMyAchievements: async (userData) => {
        const achievements = await CourseRepo.getAchievements(userData);
        return achievements;
    },
    getMyNotifications: async (userData) => {
        const notifications = await CourseRepo.getNotifications(userData);
        return notifications;
    },
    dirtNotification: async (userData) => {
        const notification = await CourseRepo.dirtNotification(userData);
        return notification;
    }, 
    actionNotification: async (userData, notificationId) => {
        const notification = await CourseRepo.actionNotification(userData, notificationId);
        return notification;
    },
    getCompletedCourse: async (userData) => {
        const courses = await CourseRepo.getCompletedCourse(userData);
        return courses;
    }
};
export default CourseService;