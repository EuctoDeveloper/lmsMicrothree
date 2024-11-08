import Enrollment from "../models/EnrollmentModel.js";

const EnrollmentRepo = {
    create: (courseId, userId, session) => {
        const data = {
            course: parseInt(courseId),
            student: userId,
        };
        return Enrollment.create([data], {session});
    },
    
};
export default EnrollmentRepo;