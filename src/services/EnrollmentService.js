import EnrollmentRepo from "../repositories/EnrollmentRepo.js";
import runWithTransaction from "../utils/rollbackCommit.js";
import CourseService from "./CourseService.js";
import LessonService from "./LessonService.js";
import ModuleService from "./ModuleService.js";

const EnrollmentService = {
    enrollUser: async (courseId, userData) => {
        const modules = await ModuleService.getModules(courseId);
        const lessons = await LessonService.getLessons(courseId);

        await runWithTransaction(async (session) => {
            const enrollment = await EnrollmentRepo.create(courseId, userData.userId, session);
            await ModuleService.enrollUser(enrollment[0].enrollmentId, modules, session);
            await LessonService.enrollUser(enrollment[0].enrollmentId, lessons, session);
        })
    }
}

export default EnrollmentService;