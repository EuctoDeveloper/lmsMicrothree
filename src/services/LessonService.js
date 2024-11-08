import Lesson from "../models/LessonModel.js";
import LessonProgress from "../models/LessonProgressModel.js";

const LessonService = {
    getLessons: async (courseId) => {
        const lessons = await Lesson.find({ course: courseId });
        return lessons;
    },
    enrollUser: async (enrollmentId, lessons, session) => {
        const lessonData = lessons.map((lesson) => {
            return {
                enrollmentId: enrollmentId,
                lessonId: parseInt(lesson.lessonId),
            };
        });
        return LessonProgress.create(lessonData, { session });
    }
};
export default LessonService;