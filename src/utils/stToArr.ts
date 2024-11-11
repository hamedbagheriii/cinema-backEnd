export class stToArrClass {
  async stToArr(st: string) {
    let arrNumber: any[] = [];
    st.split(',').map((seat: any) => arrNumber.push(Number(seat)));
    return arrNumber;
  }
}
