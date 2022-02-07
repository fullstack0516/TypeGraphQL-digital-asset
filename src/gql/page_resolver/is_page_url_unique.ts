import { PageModel } from "../../models/page_model"

export const isPageUrlUnique = async (url: string): Promise<boolean> => {
    const page = await PageModel.findOne({ url })

    return !page
}
