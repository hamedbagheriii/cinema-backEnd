// import Elysia, { t } from "elysia";
// import { Prisma } from "../auth/auth";

// export const date = new Elysia().group('/date' , (app)=>{
//     return app 

//     // ! ==================== Dates ====================

//       // ! add dates
//       .post(
//         '/dates/add',
//         async ({ body: { date, cinemaID } }) => {
//           const dateRecord = await Prisma.date.create({
//             data: {
//               date,
//               cinemaID,
//             },
//           });

//           return {
//             data: dateRecord,
//             message: 'افزودن تاریخ با موفقیت انجام شد !',
//             success: true,
//           };
//         },
//         {
//           body: t.Object({
//             date: t.Date(),
//             cinemaID: t.Number(),
//           }),
//         }
//       )

//       // ! get dates
//       .get(
//         '/dates',
//         async ({ query: { cinemaID } }) => {
//           const dates = await Prisma.date.findMany({
//             where: {
//               cinemaID,
//             },
//             include: {
//               dateTimes: true,
//               cinemaData: true,
//             },
//           });

//           return {
//             data: dates,
//             message: 'دریافت تاریخ ها با موفقیت انجام شد !',
//             success: true,
//           };
//         },
//         {
//           query: t.Object({
//             cinemaID: t.Number(),
//           }),
//         }
//       )

//       ! ==================== Date Times ====================

//       // ! add Time
//       .post(
//         '/dateTime/add',
//         async ({ body: { Time, date } }) => {
//           const newTime = await Prisma.dateTime.create({
//             data: {
//               Time,
//               date,
//             },
//           });

//           return {
//             data: newTime,
//             message: 'تایم مورد نظر اضافه شد !',
//             success: true,
//           };
//         },
//         {
//           beforeHandle: async ({ body: { Time, date } }) => {
//             const checkDate = await Prisma.date.findUnique({
//               where: {
//                 date,
//               },
//             });

//             if (!checkDate) {
//               return {
//                 message: 'روز مورد نظر یافت نشد !',
//                 success: false,
//               };
//             }
//           },
//           body: t.Object({
//             Time: t.String(),
//             date: t.Date(),
//           }),
//         }
//       )

//       // ! get Times
//       .get(
//         '/dateTime/:id?',
//         async ({ params: { id } }) => {
//           let dateTimes;
//           if (id) {
//             dateTimes = await Prisma.dateTime.findMany({
//               where: { id },
//             });
//           }
//           dateTimes = await Prisma.dateTime.findMany();

//           return {
//             data: dateTimes,
//             message: 'تایم مورد نظر اضافه شد !',
//             success: true,
//           };
//         },
//         {
//           params: t.Object({
//             id: t.Optional(t.Number()),
//           }),
//         }
//       )
// })