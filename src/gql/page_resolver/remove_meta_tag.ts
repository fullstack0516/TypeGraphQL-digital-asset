import { User } from '../../models/user_model';
import { PageModel } from '../../models/page_model';
import { isSiteOwner } from '../site_resolver/is_site_owner';
import { fetchPage } from './fetch_page';

export const removeMetaTag = async (props: {
    pageUid: string,
    metaTagUid: string,
    user: User
}) => {
    const pageToUpdate = await fetchPage(props.pageUid)
    await isSiteOwner(pageToUpdate.siteUid, props.user.uid)

    const updatedUserMetaTags = pageToUpdate.userMetaTags.filter(m => m.uid !== props.metaTagUid)

    await PageModel.updateOne(
        {
            uid: props.pageUid
        },
        {
            $set: {
                userMetaTags: updatedUserMetaTags
            },
        }
    )
}
