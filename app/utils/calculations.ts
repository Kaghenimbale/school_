import { Course } from "../types/index";

export const getMaxTotal = (courses: Course[]) => {
  return courses.reduce((acc, course) => acc + course.max, 0);
};
