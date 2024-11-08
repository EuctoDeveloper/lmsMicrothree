// this is login route file

import express from 'express';
import CourseController from '../controllers/CourseController.js';
import verifyToken from '../middlewares/verifyToken.js';
import StreamController from '../controllers/StreamController.js';
import EnrollmentController from '../controllers/EnrollmentController.js';


const courseRouter = express.Router();

courseRouter.get('/file/:key', StreamController.stream);
courseRouter.get('/listMyRecetCourses', verifyToken, CourseController.listMyRecetCourses);
//add validation
courseRouter.get('/enroll/:courseId', verifyToken, EnrollmentController.enorll);
courseRouter.get('/getCourse/:courseId', verifyToken, CourseController.getCourseDetails);
courseRouter.get('/getLesson/:lessonId', verifyToken, CourseController.getLesson);
courseRouter.post('/saveLessonProgress/:lessonId', verifyToken, CourseController.saveLessonProgress);
courseRouter.get('/listCourses', verifyToken, CourseController.listMyAllCourses);
courseRouter.get('/getMyAchievements', verifyToken, CourseController.getMyAchievements);
courseRouter.get('/getMyNotification', verifyToken, CourseController.getMyNotification);
courseRouter.get('/dirtNotification', verifyToken, CourseController.dirtNotification);
courseRouter.get('/actionNotification/:notificationId', verifyToken, CourseController.actionNotification);
courseRouter.get('/getCompletedCourse', verifyToken, CourseController.getCompletedCourse);
courseRouter.get('/downloadCertificate/:courseId', verifyToken, CourseController.downloadCertificate);

export default courseRouter;