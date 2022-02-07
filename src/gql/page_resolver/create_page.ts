import { User } from '../../models/user_model';
import { ApolloError } from 'apollo-server-errors';
import { Page, PageModel } from '../../models/page_model';
import { createUid } from '../../helpers/helpers';
import { isPageUrlUnique } from './is_page_url_unique';
import { isSiteOwner } from '../site_resolver/is_site_owner';

export const createPage = async (props: {
    title: string,
    url: string,
    siteUid: string,
    user: User
}): Promise<Page> => {
    const { title, url, siteUid, user } = props
    if (user.isFlagged) {
        throw new ApolloError('user-is-flagged', 'The user has been flagged. They cannot create pages.')
    }

    await isSiteOwner(siteUid, user.uid)

    // Check the url is unique
    if (!(await isPageUrlUnique(url))) {
        throw new ApolloError('page-url-not-unique', 'The page url was not unique.')
    }

    const page: Page = {
        uid: createUid(),
        contentSections: [],
        contentDraftSections: [],
        dataTags: [],
        userMetaTags: [],
        contentCategories: [],
        url,
        lastUpdateIso: new Date().toISOString(),
        lastPublishIso: new Date().toISOString(),
        createdIso: new Date().toISOString(),
        totalEarnings: 0,
        totalImpressions: 0,
        totalVisits: 0,
        isBanned: false,
        isDeleted: false,
        isPublished: false,
        isFlagged: false,
        siteUid,
        title,
        description: '',
        numberOfReports: 0,
        pageColor: '#FF7534',
        likes: 0,
        dislikes: 0,
        pageOwner: user.uid
    }

    await PageModel.create(page)

    return page
}
