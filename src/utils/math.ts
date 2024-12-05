class math_Class {
  async reducePrice(num: any[]) {
    if (num.length > 0) {
        
        return num
        .map((t) => t.price)
        .reduce((a, b) => {
            return a + b;
        });
    }
    else {
        return 0;
    }
  }
}

export const mathClass = new math_Class();

class convertDate {
  async convertDate(income: any[], type: string) {
    switch (type) {
      case 'today':
        return income.filter(
          (t) => t.date >= new Date(new Date().setDate(new Date().getDay()))
        );
        break;

      case 'month':
        return income.filter(
          (t) => t.date >= new Date(new Date().setMonth(new Date().getMonth() - 1))
        );
        break;

      case 'year':
        return income.filter(
          (t) => t.date >= new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        );
        break;

      default:
        break;
    }
  }
}

export const convertDateClass = new convertDate();
