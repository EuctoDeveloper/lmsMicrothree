import CourseService from "../services/CourseService.js";
import EnrollmentService from "../services/EnrollmentService.js";
import catcher from "../utils/catcher.js";

const EnrollmentController = {
    enorll: catcher(async (req, res) => {
        const userData = req.user;
        const courseId = req.params.courseId;

        if(await CourseService.checkValidCourse(courseId, userData, true)) {
            const enrollment = await EnrollmentService.enrollUser(courseId, userData);
            res.status(200).json({data: enrollment, message: 'Enrolled successfully'});
        } else {
            res.status(400).json({message: 'Invalid course'});
        }
    }),
}
export default EnrollmentController;