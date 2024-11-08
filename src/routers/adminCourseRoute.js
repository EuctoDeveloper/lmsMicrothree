// this is login route file

import express from 'express';
import CourseController from '../controllers/CourseController.js';
import StreamController from '../controllers/StreamController.js';
import EnrollmentController from '../controllers/EnrollmentController.js';
import verifyAdminToken from '../middlewares/verifyTokenAdmin.js';


const adminCourseRouter = express.Router();

adminCourseRouter.get('/courses/:userId', verifyAdminToken, CourseController.getCoursesByUser);
adminCourseRouter.get('/users/:courseId', verifyAdminToken, CourseController.getUsersByCourses);
adminCourseRouter.get('/progress/:courseId/:userId', verifyAdminToken, CourseController.getProgress);

export default adminCourseRouter;