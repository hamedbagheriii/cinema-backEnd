import Elysia, { t } from "elysia";
import { Prisma } from "../auth/auth";


export const role = new Elysia().group("/roles",(app)=>{
    return app 
    
    // ! add new permission (user or admin dont have access) =>
    .post('/perm',async ({body : {permName}})=>{
        const newPerm = await Prisma.permission.create({
            data : {
                permName
            }
        })
        
        return {
            message : 'دسترسی اضافه شد !',
            success : true,
            perm : newPerm
        }
    },{
        body : t.Object({
            permName : t.String()
        })
    })

    // ! add new role =>
    .post('/add' , async ({body : {roleName , permissions}})=>{
        const newRole = await Prisma.role.create({
            data : {
                roleName,
                permissions : {
                    create : permissions.map(permID=>{
                        return {
                            permissionID : permID
                        }
                    })
                }
            },
            include : {
                permissions : {
                    include : {
                        permissionData : true
                    }
                }
            }
        })

        return  {
            message : 'نقش با موفقیت اضافه شد !',
            success : true,
            role : newRole
        }
    },{
        beforeHandle : async ({body : {roleName , permissions} , set})=>{
            const checkRolle = await Prisma.role.findUnique({
                where : {
                    roleName
                }
            })

            // handle check there is permission =>
            permissions.map( async (permID) => {
                const checkPerm = await Prisma.permission.findUnique({
                    where : {
                        id : permID
                    }
                })

                
                if (checkPerm === null) {
                    set.status = 404 ;
                    return {
                        message : 'مجوز انتخاب شده وجود ندارد !',
                        success : false
                    }
                }
            })

            // handle check there is role =>
            if(checkRolle) {
                return {
                    message : 'این نقش قبلا ایجاد شده است !',
                    success : false
                }
            }
        },
        body : t.Object({
            roleName : t.String(),
            permissions : t.Array(t.Number())
        })
    })

})