export class AccessClass {
  async hasAccess(role: string, userRoles: any[], set: any) {
    let allPerms: any[] = [];
    userRoles.map((t) => {
      const perms = t.roleData.permissions;
      allPerms.push(...perms);
    });

    const checkRole = allPerms.filter(
      (t) =>
        t.permissionData.permName === role || t.permissionData.permName === 'allAccess'
    )[0];

    if (checkRole) return true;

    set.status = 403;
    return {
      message: 'شما دسترسی به این صفحه را ندارید !',
      success: false,
    };
  }
}

export const hasAccessClass = new AccessClass();
