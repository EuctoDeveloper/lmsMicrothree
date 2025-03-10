import Course from "../models/CourseModel.js";
import Enrollment from "../models/EnrollmentModel.js";
import Lesson from "../models/LessonModel.js";
import LessonProgress from "../models/LessonProgressModel.js";
import ModuleProgress from "../models/ModuleProgressModel.js";
import Module from "../models/ModuleModel.js";
import runWithTransaction from "../utils/rollbackCommit.js";
import logger from "../configs/loggers.js";
import User from "../models/UserModel.js";
import moment from 'moment-timezone';
import Notification from "../models/NotificationModel.js";
import generateCertificate from "../helpers/genCert.js";
import uploadBufferToS3 from "../utils/saveBufferToS3.js";

const CourseRepo = {
    getCourseByCourseCriteria: async (criteria) => {
        const todayDate = new Date();
        todayDate.setHours(todayDate.getHours() + 5);
        todayDate.setMinutes(todayDate.getMinutes() + 30);
        const course = await Course.aggregate([
            {
            $lookup: {
                from: "coursecriterias",
                localField: "courseId",
                foreignField: "courseId",
                as: "courseCriteria"
            }
            },
            {
                $unwind: {
                    path: "$courseCriteria",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
            $lookup: {
                from: "modules",
                localField: "courseId",
                foreignField: "course",
                as: "modules"
            }
            },
            {
            $unwind: {
                path: "$modules",
                preserveNullAndEmptyArrays: true
            }
            },
            {
            $match: {
                $and: [
                ...criteria,
                {isActive: true},
                { startDate: { $lte: todayDate} },
                { endDate: { $gte: todayDate} }
                ]
            }
            },
            {
            $project: {
                _id: 0,
                courseId: 1,
                title: 1,
                image: 1,
                description: 1,
                startDate: 1,
                endDate: 1,
                courseCriteria: 1,
                modules: {
                    moduleId: "$modules.moduleId",
                    title: "$modules.title",
                }
            }
            },
            {
            $group: {
                _id: "$courseId",
                courseId: { $first: "$courseId" },
                title: { $first: "$title" },
                image: { $first: "$image" },
                description: { $first: "$description" },
                startDate: { $first: "$startDate" },
                endDate: { $first: "$endDate" },
                enrolledAt: { $first: "$enrolledAt" },
                startedAt: { $first: "$startedAt" },
                completedAt: { $first: "$completedAt" },
                isCompleted: { $first: "$isCompleted" },
                completedPercentage: { $first: "$completedPercentage" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
                modules: { $push: "$modules" }
            }
            },
        ]);
        return course;
    },
    getCourseById: async (courseId, userId) => {
        console.log("getting course", courseId, userId)
        let course = await Course.aggregate([
            {
            $match: { courseId: parseInt(courseId) }
            },
            {
            $lookup: {
                from: "enrollments",
                localField: "courseId",
                foreignField: "course",
                as: "enrollment"
            }
            },
            {
                $unwind: {
                    path: "$enrollment",
                }
            },
            {
            $match: { "enrollment.student": userId }
            },
            {
            $project: {
                _id: 0,
                courseId: 1,
                title: 1,
                image: 1,
                description: 1,
                startDate: 1,
                endDate: 1,
                enrollment: 1
            }
            }
        ]);
        course = course[0];
        console.log(course, "course2")
        if (course) {
            const modules = await Module.aggregate([
                    { $match: { course: course.courseId } },
                    {
                        $lookup: {
                            from: "moduleprogresses",
                            localField: "moduleId",
                            foreignField: "moduleId",
                            as: "progress"
                        }
                    },
                    {
                        $unwind: {
                            path: "$progress",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $match: { "progress.enrollmentId": course.enrollment.enrollmentId }
                    },
                    {
                        $lookup: {
                            from: "lessons",
                            localField: "moduleId",
                            foreignField: "module",
                            as: "lessons"
                        }
                    },
                    {
                        $unwind: {
                            path: "$lessons",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: "lessonprogresses",
                            localField: "lessons.lessonId",
                            foreignField: "lessonId",
                            as: "lessons.progress"
                        }
                    },
                    {
                        $unwind: {
                            path: "$lessons.progress",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    { $match: { "lessons.progress.enrollmentId": course.enrollment.enrollmentId } },
                    {
                        $group: {
                            _id: "$moduleId",
                            moduleId: { $first: "$moduleId" },
                            title: { $first: "$title" },
                            progress: { $first: "$progress" },
                            lessons: { $push: "$lessons" }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            moduleId: 1,
                            title: 1,
                            progress: {
                                isCompleted: 1,
                                completedAt: 1,
                                completedPercentage: 1,
                                enrollmentId: 1
                            },
                            lessons: {
                                lessonId: 1,
                                title: 1,
                                type: 1,
                                source: 1,
                                totalGrade: 1,
                                questions: 1,
                                activity: 1,
                                progress: {
                                    isCompleted: 1,
                                    completedAt: 1,
                                    completedPercentage: 1,
                                    completedTime: 1,
                                    isLessonCompleted: 1,
                                    score: 1,
                                    completedPercentage: 1,
                                    enrollmentId: 1,
                                    questions: 1
                                }
                            }
                        }
                    },
                    {
                        $sort: {
                            moduleId: 1,
                            "lessons.lessonId": 1
                        }
                    }
                ]);
            console.log(modules[0].lessons, "modules")
            course = {...course, modules};
        }
        console.log(course, "course")
        return course;
    },
    getCourseById2: async (courseId, userId) => {
        let course = await Course.findOne({courseId});
        let enrollment = await Enrollment.findOne({student: userId, course: courseId});
        if (course && enrollment) {
            const modules = await Module.aggregate([
                { $match: { course: course.courseId } },
                {
                    $lookup: {
                        from: "moduleprogresses",
                        localField: "moduleId",
                        foreignField: "moduleId",
                        as: "progress"
                    }
                },
                {
                    $unwind: {
                        path: "$progress",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                $match: { "progress.enrollmentId": enrollment.enrollmentId }
                },
                {
                    $lookup: {
                        from: "lessons",
                        localField: "moduleId",
                        foreignField: "module",
                        as: "lessons"
                    }
                },
                {
                    $unwind: {
                        path: "$lessons",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "lessonprogresses",
                        localField: "lessons.lessonId",
                        foreignField: "lessonId",
                        as: "lessons.progress"
                    }
                },
                {
                    $unwind: {
                        path: "$lessons.progress",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {$match: { "lessons.progress.enrollmentId": enrollment.enrollmentId }},
                {
                    $group: {
                        _id: "$moduleId",
                        moduleId: { $first: "$moduleId" },
                        title: { $first: "$title" },
                        progress: { $first: "$progress" },
                        lessons: { $push: "$lessons" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        moduleId: 1,
                        title: 1,
                        progress: {
                            isCompleted: 1,
                            completedAt: 1,
                            completedPercentage: 1,
                            enrollmentId: 1
                        },
                        lessons: {
                            lessonId: 1,
                            title: 1,
                            type: 1,
                            source: 1,
                            totalGrade: 1,
                            questions: 1,
                            progress: {
                                isCompleted: 1,
                                completedAt: 1,
                                completedPercentage: 1,
                                completedTime: 1,
                                isLessonCompleted: 1,
                                score: 1,
                                completedPercentage: 1,
                                enrollmentId: 1,
                                questions: 1
                            }
                        }
                    }
                }
            ]);
            course = {...course._doc, modules, enrollment};
        }
        return course;
    },
    getLessonById: async (lessonId, userId) => {
        const lessonDoc = await Lesson.findOne({ lessonId: parseInt(lessonId) });
        const enrollment = await Enrollment.findOne({ student: userId, course: lessonDoc.course });
        const lesson = await LessonProgress.aggregate([
            {
            $match: {
                enrollmentId: enrollment.enrollmentId,
                lessonId: parseInt(lessonId)
            }
            },
            {
            $lookup: {
                from: "lessons",
                localField: "lessonId",
                foreignField: "lessonId",
                as: "lesson"
            }
            },
            {
            $unwind: "$lesson"
            },
            {
            $lookup: {
                from: "modules",
                localField: "moduleId",
                foreignField: "module",
                as: "modules"
            }
            },
            {
            $unwind: "$modules"
            },
            {
            $project: {
                _id: 0,
                lessonId: "$lesson.lessonId",
                title: "$lesson.title",
                type: "$lesson.type",
                source: "$lesson.source",
                totalGrade: "$lesson.totalGrade",
                questions: "$lesson.questions",
                answeredQuestion: "$questions",
                activity: "$lesson.activity",
                isCompleted: 1,
                completedAt: 1,
                completedPercentage: 1,
                completedTime: 1,
                isLessonCompleted: 1,
                score: 1,
                enrollmentId: 1,
                lmId: "$lesson.module",
                courseId: "$lesson.course",
                module: "$modules",
            }
        }]);
        const modules = await Module.find({ course: lessonDoc.course }).sort({ moduleId: -1 });
        return {...lesson[0], isLastModule: modules[0].moduleId === lesson[0].lmId};
    },
    getEnrolledCourse: async (userData) => {
        const enrolledCourses = await Enrollment.aggregate([
            {
            $match: {
                student: userData.userId
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
                enrolledAt: 1,
                startedAt: 1,
                completedAt: 1,
                isCompleted: 1,
                completedPercentage: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }]);
        return enrolledCourses;;
    },
    getRecentCourses: async (userData) => {
        const courses = await Enrollment.aggregate([
            {
            $match: {
                student: userData.userId
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
            $lookup: {
                from: "modules",
                localField: "course.courseId",
                foreignField: "course",
                as: "modules"
            }
            },
            {
            $unwind: {
                path: "$modules",
                preserveNullAndEmptyArrays: true
            }
            },
            {
            $project: {
                _id: 0,
                courseId: "$course.courseId",
                title: "$course.title",
                image: "$course.image",
                description: "$course.description",
                startDate: "$course.startDate",
                endDate: "$course.endDate",
                enrolledAt: 1,
                startedAt: 1,
                completedAt: 1,
                isCompleted: 1,
                completedPercentage: 1,
                createdAt: 1,
                updatedAt: 1,
                modules: {
                    moduleId: "$modules.moduleId",
                    title: "$modules.title",
                }
            }
            },
            {
            $group: {
                _id: "$courseId",
                courseId: { $first: "$courseId" },
                title: { $first: "$title" },
                image: { $first: "$image" },
                description: { $first: "$description" },
                startDate: { $first: "$startDate" },
                endDate: { $first: "$endDate" },
                enrolledAt: { $first: "$enrolledAt" },
                startedAt: { $first: "$startedAt" },
                completedAt: { $first: "$completedAt" },
                isCompleted: { $first: "$isCompleted" },
                completedPercentage: { $first: "$completedPercentage" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
                modules: { $push: "$modules" }
            }
            },
            {
            $sort: {
                updatedAt: -1
            }
            }
        ]);
        return courses;
    },
    getModulesByEnrolmentId: async (enrollmentId) => {
        const modules = await ModuleProgress.aggregate([
            {
            $match: {
                enrollment: enrollmentId
            }
            },
            {
            $lookup: {
                from: "modules",
                localField: "module",
                foreignField: "moduleId",
                as: "module"
            }
            },
            {
            $unwind: "$module"
            },
            {
            $project: {
                _id: 0,
                moduleId: "$module.moduleId",
                title: "$module.title",
                isCompleted: 1,
                completedAt: 1,
                completedPercentage: 1
            }
        }]);
        return modules;
                
    },
    getEnrolledLessonsByModuleId: async (moduleId, enrollmentId,) => {
        const lessons = await LessonProgress.aggregate([
            {
            $match: {
                enrollment: enrollmentId,
                module: moduleId
            }
            },
            {
            $lookup: {
                from: "lessons",
                localField: "lesson",
                foreignField: "lessonId",
                as: "lesson"
            }
            },
            {
            $unwind: "$lesson"
            },
            {
            $project: {
                _id: 0,
                lessonId: "$lesson.lessonId",
                title: "$lesson.title",
                isCompleted: 1,
                completedAt: 1,
                completedPercentage: 1
            }
        }]);
        return lessons;
    },
    saveLessonProgress: async (lessonId, userData, data) => {
        return await runWithTransaction(async (session) => {
            const userId = userData.userId;
            const lessonDoc = await Lesson.findOne({ lessonId: parseInt(lessonId) });
            const enrollment = await Enrollment.findOne({ student: userId, course: lessonDoc.course });
            const lessonProgress = await LessonProgress.findOne(
                { lessonId: lessonDoc.lessonId, enrollmentId: enrollment.enrollmentId },
            );
            if(lessonDoc.type !== "video" ) {
                let alreadyAnswerd = false;
                for (let i = 0; i < lessonProgress?.questions.length; i++) {
                    if (lessonProgress.questions[i].sourceQuestionId.toString() === data.questionId) {
                        alreadyAnswerd = true;
                        break;
                    }
                }
                if (alreadyAnswerd) {
                    logger.error("Question already answered");
                    return;
                }
                const questionExists = lessonDoc.questions.some(q => q._id.toString() === data.questionId);
                if (!questionExists) {
                    logger.error("Question does not exist");
                    return;
                }
                if(lessonProgress.questions)
                    lessonProgress.questions.push({sourceQuestionId: data.questionId, answer: data.selectedOption});
                else
                    lessonProgress.questions = [{sourceQuestionId: data.questionId, answer: data.selectedOption}];

                const question = lessonDoc.questions.find(q => q._id.toString() === data.questionId);
                if (question && question.correctAnswer === data.selectedOption) {
                    lessonProgress.score = (lessonProgress.score || 0) + question.points;
                }

                const totalQuestions = lessonDoc.questions.length;
                const answeredQuestions = lessonProgress.questions.length;
                lessonProgress.completedPercentage = Math.round((answeredQuestions / totalQuestions) * 100);
                lessonProgress.isLessonCompleted = lessonProgress.completedPercentage === 100;

            } else {
                lessonProgress.completedPercentage = data.completedPercentage;
                lessonProgress.isLessonCompleted = data.isCompleted;
                lessonProgress.completedTime = data.completedTime
            }
            await lessonProgress.save({session});

            const moduleProgress = await ModuleProgress.findOne({ moduleId: lessonDoc.module, enrollmentId: enrollment.enrollmentId });
            const lessonsInModule = await Lesson.find({ module: lessonDoc.module });
            let completedLessonsInModule = await LessonProgress.find({ lessonId: {$in: lessonsInModule.map(item=>item.lessonId)}, enrollmentId: enrollment.enrollmentId })
            completedLessonsInModule = completedLessonsInModule.map(item=> item.lessonProgressId === lessonProgress.lessonProgressId ? lessonProgress : item);
        
            moduleProgress.completedPercentage = Math.round(completedLessonsInModule.reduce((value, item)=>value+item.completedPercentage, 0) / completedLessonsInModule.length);
            moduleProgress.isCompleted = moduleProgress.completedPercentage === 100;
            await moduleProgress.save({session});

            const modulesInCourse = await Module.find({ course: lessonDoc.course });
            let completedModulesInCourse = await ModuleProgress.find({ moduleId: {$in: modulesInCourse.map(item=>item.moduleId) }, enrollmentId: enrollment.enrollmentId});
            completedModulesInCourse = completedModulesInCourse.map(item=> item.moduleProgressId === moduleProgress.moduleProgressId ? moduleProgress : item);

            enrollment.completedPercentage = Math.round(completedModulesInCourse.reduce((value, item)=>value+item.completedPercentage, 0) / completedModulesInCourse.length);
            enrollment.isCompleted = enrollment.completedPercentage === 100;
            enrollment.completedAt = enrollment.isCompleted ? new Date() : null;
            if(enrollment.isCompleted) {
                let course = await  Course.findOne({courseId: lessonDoc.course});

                const data = {
                    name: userData.firstName + " " + userData.lastName,
                    program: course.title,
                    date: new Date(enrollment.completedAt || course.endDate).toLocaleDateString('en-GB')
                };
                
                const imageBuffer = await generateCertificate(data);
                
                let result = await uploadBufferToS3(imageBuffer, `certificate-${userId}-${course.courseId}.png`);
                enrollment.certificate = result.Location;
            }
            await enrollment.save({session});
            
            return;
        });
    },
    getCourseAndProgressByCourseCriteria: async (criteria, userId) => {
        const course = await Course.aggregate([
            {
            $lookup: {
            from: "coursecriterias",
            localField: "courseId",
            foreignField: "courseId",
            as: "courseCriteria"
            }
            },
            {
            $unwind: "$courseCriteria"
            },
            {
            $lookup: {
            from: "enrollments",
            localField: "courseId",
            foreignField: "course",
            as: "progress"
            }
            },
            {
            $unwind: {
                path: "$progress",
                preserveNullAndEmptyArrays: true
            }
            },
            {
            $match: {
            $and: [
            ...criteria,
            {"progress.student": userId},
            ]
            }
            },
            {
            $project: {
            _id: 0,
            courseId: 1,
            title: 1,
            image: 1,
            description: 1,
            startDate: 1,
            endDate: 1,
            createdAt: 1,
            courseCriteria: 1,
            isActive: 1,
            progress: {
                enrollmentId: "$progress.enrollmentId",
                completedPercentage: "$progress.completedPercentage",
                student: "$progress.student"
            }
            }
            },
            {
            $group: {
            _id: "$courseId",
            courseId: { $first: "$courseId" },
            title: { $first: "$title" },
            image: { $first: "$image" },
            description: { $first: "$description" },
            startDate: { $first: "$startDate" },
            endDate: { $first: "$endDate" },
            enrolledAt: { $first: "$enrolledAt" },
            startedAt: { $first: "$startedAt" },
            completedAt: { $first: "$completedAt" },
            isCompleted: { $first: "$isCompleted" },
            completedPercentage: { $first: "$completedPercentage" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            isActive: { $first: "$isActive" },
            progress: { $push: "$progress" }
            }
            },
        ]);
        return course;
    },
    getUsersByCourseCritria: async (courseCriteria, courseId) => {
        let critera = [];
        if(!courseCriteria.userRole.includes("*")) {
            critera.push({role: courseCriteria.userRole[0] === "client" ? "customer" : "employee"});
        }
        if((!courseCriteria.center.includes("*")) && courseCriteria.center.length > 0) {
            critera.push({centerId: {$in: courseCriteria.center}});
        }
        if((!courseCriteria.group.includes("*")) && courseCriteria.group.length > 0) {
            critera.push({groupId: {$in: courseCriteria.group}});
        }
        if((!courseCriteria.location.includes("*")) && courseCriteria.location.length > 0) {
            critera.push({locationId: {$in: courseCriteria.location}});
        }
        if((!courseCriteria.department.includes("*")) && courseCriteria.department.length > 0) {
            critera.push({departmentId: {$in: courseCriteria.department}});
        }
        if((!courseCriteria.designation.includes("*")) && courseCriteria.designation.length > 0) {
            critera.push({designationId: {$in: courseCriteria.designation}});
        }
        if((!courseCriteria.branch.includes("*")) && courseCriteria.branch.length > 0) {
            critera.push({branchId: {$in: courseCriteria.branch}});
        }
        const users = await User.aggregate([
            {
            $lookup: {
            from: "enrollments",
            localField: "userId",
            foreignField: "student",
            as: "enrollment"
            }
            },
            {
            $unwind: {
            path: "$enrollment",
            preserveNullAndEmptyArrays: true
            }
            },
            {
            $match: {
            $and: [
            ...critera,
            {isActive: true},
            { $or: [{"enrollment.course": courseId}, {"enrollment": {$eq: null}}] }
            ]
            }
            },
            {
            $project: {
            _id: 0,
            userId: 1,
            firstName: 1,
            lastName: 1,
            name: 1,
            email: 1,
            phone: 1,
            enrollment: { 
            id: "$enrollment.enrollmentId",
            completedPercentage: "$enrollment.completedPercentage",
             }
            }
            }
        ]);
        return users;
    },
    getAchievements: async (userData) => {
        console.log(userData)
        const achievements = await Enrollment.find({student: userData.userId, isCompleted: true});
        const lessons = await Lesson.find({ course: { $in: achievements.map(item => item.course) }, type: { $ne: "video" } });
        const lessonProgresses = await LessonProgress.aggregate([
            {
                $lookup: {
                    from: "enrollments",
                    localField: "enrollmentId",
                    foreignField: "enrollmentId",
                    as: "enrollment"
                }
            },
            {
                $lookup: {
                    from: "lessons",
                    localField: "lessonId",
                    foreignField: "lessonId",
                    as: "lesson"
                }
            },
            {
            $lookup: {
                from: "courses",
                localField: "enrollment.course",
                foreignField: "courseId",
                as: "course"
            }
            },
            {
            $match: {
                lessonId: { $in: lessons.map(item => item.lessonId) }
            }
            },
            {
            $unwind: "$course"
            },
            {
                $unwind: "$lesson"  // Unwind the lesson array
            },
            {
            $group: {
                _id: "$enrollmentId",
                totalGrade: { $sum: "$lesson.totalGrade" },
                totalScore: { $sum: "$score" },
                courseTitle: { $first: "$course.title" },
                courseImage: { $first: "$course.image" },
                description: { $first: "$course.description" },
                startDate: { $first: "$course.startDate" },
                endDate: { $first: "$course.endDate" },
            }
            }
        ]);
        return lessonProgresses;
    },
    getNotifications: async (userData) => {
        const todayDate = new Date();
        todayDate.setHours(todayDate.getHours() + 5);
        todayDate.setMinutes(todayDate.getMinutes() + 30);
        const notifications = await Notification.find({
            userId: userData.userId,
            actioned: false,
            availableAt: { $lte: todayDate },
            expireAt: { $gte: todayDate }
        }).sort({ createdAt: -1 });
        return notifications;
    },
    dirtNotification: async (userData) => {
        const todayDate = new Date();
        todayDate.setHours(todayDate.getHours() + 5);
        todayDate.setMinutes(todayDate.getMinutes() + 30);
        const notifications = await Notification.updateMany({
            userId: userData.userId,
            actioned: false,
            availableAt: { $lte: todayDate },
            expireAt: { $gte: todayDate },
            dirty: false
        }, {dirty: true});
        return notifications;
    },
    actionNotification: async (userData, notificationId) => {
        const notification = await Notification.findOne({userId: userData.userId, notificationId});
        notification.actioned = true;
        await notification.save();
        return notification;
    },
    getCompletedCourse: async (userData) => {
        const completedCourses = await Enrollment.aggregate([
            {
                $match: { 
                    student: userData.userId, 
                    isCompleted: true 
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
                    enrolledAt: 1,
                    certificate: 1,
                    startedAt: 1,
                    completedAt: 1,
                    isCompleted: 1,
                    completedPercentage: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ])
        return completedCourses;
    }
}

export default CourseRepo;