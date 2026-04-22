"use server";

import { revalidatePath } from "next/cache";
import {
  AnnouncementSchema,
  AssignmentSchema,
  AttendanceSchema,
  ClassSchema,
  ExamSchema,
  EventSchema,
  LessonSchema,
  ParentSchema,
  ResultSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from "../formValidationSchemas";
import prisma from "./prisma";
import { hashPassword } from "./password";
import { getSession } from "./auth";
import type { Role } from "../auth/types";

type CurrentState = { success: boolean; error: boolean };

async function hasAnyRole(roles: Role[]) {
  const session = await getSession();
  return !!session && roles.includes(session.role);
}

async function getSessionIfRole(roles: Role[]) {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) return null;
  return session;
}

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    if (!(await hasAnyRole(["admin"]))) {
      return { success: false, error: true };
    }
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    if (!(await hasAnyRole(["admin"]))) {
      return { success: false, error: true };
    }
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    if (!(await hasAnyRole(["admin"]))) {
      return { success: false, error: true };
    }
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    if (!(await hasAnyRole(["admin"]))) {
      return { success: false, error: true };
    }
    await prisma.class.create({
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    if (!(await hasAnyRole(["admin"]))) {
      return { success: false, error: true };
    }
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    if (!(await hasAnyRole(["admin"]))) {
      return { success: false, error: true };
    }
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    if (!(await hasAnyRole(["admin"]))) {
      return { success: false, error: true };
    }
    if (!data.password) {
      return { success: false, error: true };
    }

    const password = hashPassword(data.password);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: data.username,
          email: data.email || null,
          role: "teacher",
          passwordHash: password.hash,
          passwordSalt: password.salt,
        },
      });

      await tx.teacher.create({
        data: {
          id: user.id,
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address,
          img: data.img || null,
          bloodType: data.bloodType,
          sex: data.sex,
          birthday: data.birthday,
          subjects: {
            connect: data.subjects?.map((subjectId: string) => ({
              id: parseInt(subjectId),
            })),
          },
        },
      });
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    if (!(await hasAnyRole(["admin"]))) {
      return { success: false, error: true };
    }
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: data.id },
        data: {
          username: data.username,
          email: data.email || null,
          ...(data.password
            ? (() => {
                const nextPassword = hashPassword(data.password);
                return {
                  passwordHash: nextPassword.hash,
                  passwordSalt: nextPassword.salt,
                };
              })()
            : {}),
        },
      });

      await tx.teacher.update({
        where: {
          id: data.id,
        },
        data: {
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address,
          img: data.img || null,
          bloodType: data.bloodType,
          sex: data.sex,
          birthday: data.birthday,
          subjects: {
            set: data.subjects?.map((subjectId: string) => ({
              id: parseInt(subjectId),
            })),
          },
        },
      });
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    if (!(await hasAnyRole(["admin"]))) {
      return { success: false, error: true };
    }
    await prisma.user.delete({
      where: { id },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  try {
    if (!(await hasAnyRole(["admin"]))) {
      return { success: false, error: true };
    }
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    if (!data.password) {
      return { success: false, error: true };
    }

    const password = hashPassword(data.password);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: data.username,
          email: data.email || null,
          role: "student",
          passwordHash: password.hash,
          passwordSalt: password.salt,
        },
      });

      await tx.student.create({
        data: {
          id: user.id,
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address,
          img: data.img || null,
          bloodType: data.bloodType,
          sex: data.sex,
          birthday: data.birthday,
          gradeId: data.gradeId,
          classId: data.classId,
          parentId: data.parentId,
        },
      });
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    if (!(await hasAnyRole(["admin"]))) {
      return { success: false, error: true };
    }
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: data.id },
        data: {
          username: data.username,
          email: data.email || null,
          ...(data.password
            ? (() => {
                const nextPassword = hashPassword(data.password);
                return {
                  passwordHash: nextPassword.hash,
                  passwordSalt: nextPassword.salt,
                };
              })()
            : {}),
        },
      });

      await tx.student.update({
        where: {
          id: data.id,
        },
        data: {
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address,
          img: data.img || null,
          bloodType: data.bloodType,
          sex: data.sex,
          birthday: data.birthday,
          gradeId: data.gradeId,
          classId: data.classId,
          parentId: data.parentId,
        },
      });
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    if (!(await hasAnyRole(["admin"]))) {
      return { success: false, error: true };
    }
    await prisma.user.delete({
      where: { id },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    const session = await getSessionIfRole(["admin", "teacher"]);
    if (!session) return { success: false, error: true };

    if (session.role === "teacher") {
      const lesson = await prisma.lesson.findFirst({
        where: { id: data.lessonId, teacherId: session.userId },
        select: { id: true },
      });
      if (!lesson) return { success: false, error: true };
    }

    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    const session = await getSessionIfRole(["admin", "teacher"]);
    if (!session) return { success: false, error: true };

    if (session.role === "teacher") {
      const lesson = await prisma.lesson.findFirst({
        where: { id: data.lessonId, teacherId: session.userId },
        select: { id: true },
      });
      if (!lesson) return { success: false, error: true };
    }

    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    const session = await getSessionIfRole(["admin", "teacher"]);
    if (!session) return { success: false, error: true };

    if (session.role === "admin") {
      await prisma.exam.delete({ where: { id: parseInt(id) } });
      return { success: true, error: false };
    }

    const deleted = await prisma.exam.deleteMany({
      where: { id: parseInt(id), lesson: { teacherId: session.userId } },
    });
    if (deleted.count === 0) return { success: false, error: true };

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    if (!(await hasAnyRole(["admin"]))) return { success: false, error: true };
    if (!data.password) return { success: false, error: true };

    const password = hashPassword(data.password);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: data.username,
          email: data.email || null,
          role: "parent",
          passwordHash: password.hash,
          passwordSalt: password.salt,
        },
      });

      await tx.parent.create({
        data: {
          id: user.id,
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null,
          phone: data.phone,
          address: data.address,
        },
      });
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    if (!(await hasAnyRole(["admin"]))) return { success: false, error: true };

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: data.id },
        data: {
          username: data.username,
          email: data.email || null,
          ...(data.password
            ? (() => {
                const nextPassword = hashPassword(data.password);
                return {
                  passwordHash: nextPassword.hash,
                  passwordSalt: nextPassword.salt,
                };
              })()
            : {}),
        },
      });

      await tx.parent.update({
        where: { id: data.id },
        data: {
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null,
          phone: data.phone,
          address: data.address,
        },
      });
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    if (!(await hasAnyRole(["admin"]))) return { success: false, error: true };
    await prisma.user.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    const session = await getSessionIfRole(["admin", "teacher"]);
    if (!session) return { success: false, error: true };

    const teacherId = session.role === "teacher" ? session.userId : data.teacherId;

    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    const session = await getSessionIfRole(["admin", "teacher"]);
    if (!session) return { success: false, error: true };

    const teacherId = session.role === "teacher" ? session.userId : data.teacherId;

    if (session.role === "admin") {
      await prisma.lesson.update({
        where: { id: data.id },
        data: {
          name: data.name,
          day: data.day,
          startTime: data.startTime,
          endTime: data.endTime,
          subjectId: data.subjectId,
          classId: data.classId,
          teacherId,
        },
      });
      return { success: true, error: false };
    }

    const updated = await prisma.lesson.updateMany({
      where: { id: data.id, teacherId: session.userId },
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId,
      },
    });
    if (updated.count === 0) return { success: false, error: true };

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const session = await getSessionIfRole(["admin", "teacher"]);
    if (!session) return { success: false, error: true };

    if (session.role === "admin") {
      await prisma.lesson.delete({ where: { id: parseInt(id) } });
      return { success: true, error: false };
    }

    const deleted = await prisma.lesson.deleteMany({
      where: { id: parseInt(id), teacherId: session.userId },
    });
    if (deleted.count === 0) return { success: false, error: true };

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    const session = await getSessionIfRole(["admin", "teacher"]);
    if (!session) return { success: false, error: true };

    if (session.role === "teacher") {
      const lesson = await prisma.lesson.findFirst({
        where: { id: data.lessonId, teacherId: session.userId },
        select: { id: true },
      });
      if (!lesson) return { success: false, error: true };
    }

    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    const session = await getSessionIfRole(["admin", "teacher"]);
    if (!session) return { success: false, error: true };

    if (session.role === "admin") {
      await prisma.assignment.update({
        where: { id: data.id },
        data: {
          title: data.title,
          startDate: data.startDate,
          dueDate: data.dueDate,
          lessonId: data.lessonId,
        },
      });
      return { success: true, error: false };
    }

    const updated = await prisma.assignment.updateMany({
      where: { id: data.id, lesson: { teacherId: session.userId } },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });
    if (updated.count === 0) return { success: false, error: true };

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const session = await getSessionIfRole(["admin", "teacher"]);
    if (!session) return { success: false, error: true };

    if (session.role === "admin") {
      await prisma.assignment.delete({ where: { id: parseInt(id) } });
      return { success: true, error: false };
    }

    const deleted = await prisma.assignment.deleteMany({
      where: { id: parseInt(id), lesson: { teacherId: session.userId } },
    });
    if (deleted.count === 0) return { success: false, error: true };

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    const session = await getSessionIfRole(["admin", "teacher"]);
    if (!session) return { success: false, error: true };

    if (session.role === "teacher") {
      if (data.examId) {
        const exam = await prisma.exam.findFirst({
          where: { id: data.examId, lesson: { teacherId: session.userId } },
          select: { id: true },
        });
        if (!exam) return { success: false, error: true };
      }
      if (data.assignmentId) {
        const assignment = await prisma.assignment.findFirst({
          where: { id: data.assignmentId, lesson: { teacherId: session.userId } },
          select: { id: true },
        });
        if (!assignment) return { success: false, error: true };
      }
    }

    await prisma.result.create({
      data: {
        score: data.score,
        studentId: data.studentId,
        examId: data.examId,
        assignmentId: data.assignmentId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    const session = await getSessionIfRole(["admin", "teacher"]);
    if (!session) return { success: false, error: true };

    if (session.role === "admin") {
      await prisma.result.update({
        where: { id: data.id },
        data: {
          score: data.score,
          studentId: data.studentId,
          examId: data.examId,
          assignmentId: data.assignmentId,
        },
      });
      return { success: true, error: false };
    }

    const existing = await prisma.result.findFirst({
      where: { id: data.id },
      include: {
        exam: { include: { lesson: { select: { teacherId: true } } } },
        assignment: { include: { lesson: { select: { teacherId: true } } } },
      },
    });
    const teacherId =
      existing?.exam?.lesson.teacherId ?? existing?.assignment?.lesson.teacherId;
    if (!existing || teacherId !== session.userId) {
      return { success: false, error: true };
    }

    await prisma.result.update({
      where: { id: data.id },
      data: {
        score: data.score,
        studentId: data.studentId,
        examId: data.examId,
        assignmentId: data.assignmentId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const session = await getSessionIfRole(["admin", "teacher"]);
    if (!session) return { success: false, error: true };

    if (session.role === "admin") {
      await prisma.result.delete({ where: { id: parseInt(id) } });
      return { success: true, error: false };
    }

    const existing = await prisma.result.findFirst({
      where: { id: parseInt(id) },
      include: {
        exam: { include: { lesson: { select: { teacherId: true } } } },
        assignment: { include: { lesson: { select: { teacherId: true } } } },
      },
    });
    const teacherId =
      existing?.exam?.lesson.teacherId ?? existing?.assignment?.lesson.teacherId;
    if (!existing || teacherId !== session.userId) {
      return { success: false, error: true };
    }

    await prisma.result.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  try {
    const session = await getSessionIfRole(["admin", "teacher"]);
    if (!session) return { success: false, error: true };

    if (session.role === "teacher") {
      const lesson = await prisma.lesson.findFirst({
        where: { id: data.lessonId, teacherId: session.userId },
        select: { id: true },
      });
      if (!lesson) return { success: false, error: true };
    }

    await prisma.attendance.create({
      data: {
        date: data.date,
        present: data.present,
        studentId: data.studentId,
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    const session = await getSessionIfRole(["admin", "teacher"]);
    if (!session) return { success: false, error: true };

    if (session.role === "admin") {
      await prisma.attendance.update({
        where: { id: data.id },
        data: {
          date: data.date,
          present: data.present,
          studentId: data.studentId,
          lessonId: data.lessonId,
        },
      });
      return { success: true, error: false };
    }

    const updated = await prisma.attendance.updateMany({
      where: { id: data.id, lesson: { teacherId: session.userId } },
      data: {
        date: data.date,
        present: data.present,
        studentId: data.studentId,
        lessonId: data.lessonId,
      },
    });
    if (updated.count === 0) return { success: false, error: true };

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAttendance = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const session = await getSessionIfRole(["admin", "teacher"]);
    if (!session) return { success: false, error: true };

    if (session.role === "admin") {
      await prisma.attendance.delete({ where: { id: parseInt(id) } });
      return { success: true, error: false };
    }

    const deleted = await prisma.attendance.deleteMany({
      where: { id: parseInt(id), lesson: { teacherId: session.userId } },
    });
    if (deleted.count === 0) return { success: false, error: true };

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    if (!(await hasAnyRole(["admin"]))) return { success: false, error: true };
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId ?? null,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    if (!(await hasAnyRole(["admin"]))) return { success: false, error: true };
    await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId ?? null,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    if (!(await hasAnyRole(["admin"]))) return { success: false, error: true };
    await prisma.event.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    if (!(await hasAnyRole(["admin"]))) return { success: false, error: true };
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId ?? null,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    if (!(await hasAnyRole(["admin"]))) return { success: false, error: true };
    await prisma.announcement.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId ?? null,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    if (!(await hasAnyRole(["admin"]))) return { success: false, error: true };
    await prisma.announcement.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
