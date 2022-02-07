const iso =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/
const url = /^[a-z0-9-]+$/
const color = /^#[a-z0-9A-Z]+$/
/**
* Validate if a field is ISO.
*/
export const validateIsoFormat = {
    validator: (v: any) => {
        if (typeof v == 'string') {
            const parts = v.match(iso)
            if (parts == null) {
                return false
            }
            return true
        }
        return false
    },
    message: 'value_not_iso',
}

export const validateURL = {
    validator: (v: any) => {
        if (typeof v == 'string') {
            const parts = v.match(url)
            if (parts == null) {
                return false
            }
            return true
        }
        return false
    },
    message: 'value_not_url',
}

export const validateColor = {
    validator: (v: any) => {
        if (typeof v == 'string') {
            const parts = v.match(color)
            if (parts == null) {
                return false
            }
            return true
        }
        return false
    },
    message: 'value_not_color',
}
