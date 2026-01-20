abstract class Utilities {
  static async sleep(timeout:number):Promise<void> {
    return await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, timeout)
    })
  }

  static mergeObjects<T1 extends Record<string, any>, T2 extends Record<string, any>>(object1: T1, object2: T2):T1&T2 {
    let newObject = JSON.parse(JSON.stringify(object1));
    Object.keys(object2).forEach((key) => {
      newObject[key] = {
        ...newObject[key],
       ...object2[key]
      }
    })
    return newObject;
  }

  static deepCopyObjects<T extends {}>(object: T):T {
    return JSON.parse(JSON.stringify(object));
  }

  static getDiffObjKeys(object1: any, object2: any):any {
    const obj:any = {};
    Object.keys(object1).forEach(key => {
      if(object2[key] === undefined) {
        obj[key] = object1[key];
        return;
      }
      if(typeof object1[key] === "object") {
        if(typeof object2[key] === "object") {
          obj[key] = Utilities.getDiffObjKeys(object1[key], object2[key]);
        }else obj[key] = object1[key];
      }else {
        if(object1[key] !== object2[key]) obj[key] = object1[key];
      }
    });
    return obj;
  }
}

export default Utilities;