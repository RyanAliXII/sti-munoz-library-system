export const constructQuery= (word: string):string=>{
    const WHITESPACE_CODE = 32;
    let prevChar = ""
    let query:string = ""
    for (const char of word){
        if(prevChar.charCodeAt(0)  <= WHITESPACE_CODE && char.charCodeAt(0) <= WHITESPACE_CODE){
            continue
        }
        if (char.charCodeAt(0) <= WHITESPACE_CODE) {
            prevChar = char
           query =  query.concat("+")
            continue
        }
        prevChar = char
        query = query.concat(char)
    }
    return query
}
export const falsyValidate = <T>(value:any, fallback:T)=>{
          if(value === null || value === undefined || !value){
            return fallback
          } 
          return value
}