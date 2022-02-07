import multer from 'multer'

export const fileDest = '/tmp/'
export const uploadMiddleware = multer({
    dest: fileDest,
    limits: { fileSize: 100000000 },
})
