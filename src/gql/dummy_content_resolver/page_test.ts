import { adjectives, animals, colors, uniqueNamesGenerator } from "unique-names-generator";
import { Page } from "../../models/page_model";
import { User } from "../../models/user_model";
import { createPage } from "../page_resolver/create_page";
import { createTestUser } from "./user_test";

const createPageName = () => {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '',
        length: 1,
        style: 'capital',
    });
}

export const createPageUrl = () => {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '-',
        length: 3,
        style: 'lowerCase',
    });
}

export const createTestPage = async (siteUid: string, props?: { user?: User, overrideData?: any }): Promise<Page> => {

    let user;

    if (props?.user) {
        user = props.user;
    } else {
        const data = await createTestUser();
        user = data.user
    }

    const sendData = {
        ...{
            title: createPageName(),
            // Lower case and hypthens only.
            url: createPageUrl(),
            siteUid,
        },
        ...props?.overrideData ?? {},
    }

    const page = await createPage({
        user,
        ...sendData
    })

    return page
}