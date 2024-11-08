import generateCertificate from "../helpers/genCert.js";
import Enrollment from "../models/EnrollmentModel.js";
import CourseService from "../services/CourseService.js";
import catcher from "../utils/catcher.js";
import uploadBufferToS3 from "../utils/saveBufferToS3.js";

const CourseController = {
    listMyCourses: catcher(async (req, res) => {
        const userData = req.user;
        const courses = await CourseService.getMyAvailableCourses(userData);
        res.status(200).json({data: courses, message: 'Courses fetched successfully'});
    }),
    listMyRecetCourses: catcher(async (req, res) => {
        const userData = req.user;
        const courses = await CourseService.getMyRecentCourses(userData);
        res.status(200).json({data: courses, message: 'Courses fetched successfully'});
    }),
    listMyAllCourses: catcher(async (req, res) => {
        const userData = req.user;
        const courses = await CourseService.getMyRecentCourses(userData, "all");
        res.status(200).json({data: courses, message: 'Courses fetched successfully'});
    }),
    getCourseDetails: catcher(async (req, res) => {
        const courseId = req.params.courseId;
        const userData = req.user;
        const course = await CourseService.getCourse(courseId, userData.userId);
        res.status(200).json({data: course, message: 'Course fetched successfully'});
    }),
    listEnrolledModules: catcher(async (req, res) => {
        const courseId = req.params.courseId;
        const enrollmentId = req.params.enrollmentId;
        const userData = req.user;
        const isValidCourse = await CourseService.checkValidCourse(courseId, userData);
        if(!isValidCourse) {
            return res.status(400).json({message: 'Invalid course'});
        }
        const modules = await CourseService.getEnrolledModulesByCourseId(enrollmentId);
        res.status(200).json({data: modules, message: 'Modules fetched successfully'});
    }),
    listEnrolledLessons: catcher(async (req, res) => {
        const moduleId = req.params.moduleId;
        const enrollmentId = req.params.enrollmentId;
        const courseId = req.params.courseId;
        const userData = req.user;
        const isValidCourse = await CourseService.checkValidCourse(courseId, userData);
        if(!isValidCourse) {
            return res.status(400).json({message: 'Invalid course'});
        }
        const lessons = await CourseService.getEnrolledLessonsByModuleId(moduleId, enrollmentId);
        res.status(200).json({data: lessons, message: 'Lessons fetched successfully'});
    }),
    getLesson: catcher(async (req, res) => {
        const lessonId = req.params.lessonId;
        const userId = req.user.userId;
        const lesson = await CourseService.getLesson(lessonId, userId);
        res.status(200).json({data: lesson, message: 'Lesson fetched successfully'});
    }),
    saveLessonProgress: catcher(async (req, res) => {
        const lessonId = req.params.lessonId;
        const user = req.user;
        console.log(user)
        const lessonProgress = req.body;
        const progress = await CourseService.saveLessonProgress(lessonId, user, lessonProgress);
        res.status(200).json({data: progress, message: 'Lesson progress saved Successfully'});
    }),
    getCoursesByUser: catcher(async (req, res) => {
        const userId = req.params.userId;
        const courses = await CourseService.getCoursesByUser(userId);
        res.status(200).json({data: courses, message: 'Courses fetched successfully'});
    }),
    getUsersByCourses: catcher(async (req, res) => {
        const courseId = parseInt(req.params.courseId);
        const users = await CourseService.getUsersByCourse(courseId);
        res.status(200).json({data: users, message: 'Users fetched successfully'});
    }),
    getProgress: catcher(async (req, res) => {
        const courseId = req.params.courseId;
        const userId = req.params.userId;
        const progress = await CourseService.getCourse2(courseId, userId);
        res.status(200).json({data: progress, message: 'Progress fetched successfully'});
    }),
    getMyAchievements: catcher(async (req, res) => {
        const userData = req.user;
        const achievements = await CourseService.getMyAchievements(userData);
        res.status(200).json({data: achievements, message: 'Achievements fetched successfully'});
    }),
    getMyNotification: catcher(async (req, res) => {
        const userData = req.user;
        const notifications = await CourseService.getMyNotifications(userData);
        res.status(200).json({data: notifications, message: 'Notifications fetched successfully'});
    }),
    dirtNotification: catcher(async (req, res) => {;
        const userData = req.user;
        const notification = await CourseService.dirtNotification(userData);
        res.status(200).json({data: notification, message: 'Notification marked as dirt successfully'});
    }),
    actionNotification: catcher(async (req, res) => {
        const userData = req.user;
        const notificationId = req.params.notificationId;
        const notification = await CourseService.actionNotification(userData, notificationId);
        res.status(200).json({data: notification, message: 'Notification actioned successfully'});
    }),
    getCompletedCourse: catcher(async (req, res) => {
        const userData = req.user;
        const courses = await CourseService.getCompletedCourse(userData);
        res.status(200).json({data: courses, message: 'Courses fetched successfully'});
    }),
    downloadCertificate: catcher(async (req, res) => {
        const userData = req.user;
        const courseId = req.params.courseId;
        const courseDetail = await Enrollment.aggregate([
            {
                $match: { 
                    student: userData.userId, 
                    isCompleted: true,
                    course: parseInt(courseId)
                }
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "course",
                    foreignField: "courseId",
                    as: "course"
                }
            },
            {
                $unwind: "$course"
            },
            {
                $project: {
                    _id: 0,
                    courseId: "$course.courseId",
                    title: "$course.title",
                    image: "$course.image",
                    description: "$course.description",
                    endDate: "$course.endDate",
                    enrolledAt: 1,
                    startedAt: 1,
                    completedAt: 1,
                    isCompleted: 1,
                    completedPercentage: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]); 
        console.log(courseDetail[0].endDate)

        console.log(result, JSON.stringify(result))

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'attachment; filename="certificate.png"');
        
        res.send(imageBuffer);
    }),

    // listModules: catcher
    //list lessons
}

export default CourseController;