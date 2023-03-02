export const BUCKET = "sti.munoz.edsa.library"
export const S3_URL = "http://localhost:5207"

export const  buildS3Url = (s3key: string)=>{
    return `${S3_URL}/${BUCKET}${s3key}`
}