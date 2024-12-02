class checkThereIs {
    // validate for there is data in db =>
    async validate(validateArry: any[] , dataArry: any[] , set: any, title: string) {
      let isTrue: boolean = true;
  
      validateArry = validateArry.map((t) => t.id);
  
      await Promise.all(
        dataArry.map(async (item) => {
          if (!validateArry.includes(item)) {
            return (isTrue = false);
          }
        })
      );
  
      if (!isTrue) {
        set.status = 404;
        return {
          message: `${title} مورد نظر وجود ندارد !`,
          success: false,
        };
      }
    }
  }
export const checkClass = new checkThereIs();