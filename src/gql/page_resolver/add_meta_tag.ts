import { User } from '../../models/user_model';
import { PageModel } from '../../models/page_model';
import { createUid } from '../../helpers/helpers';
import { isSiteOwner } from '../site_resolver/is_site_owner';
import { MetaTag } from '../../models/meta_tag';
import { fetchPage } from './fetch_page';

export const addMetaTag = async (props: {
    pageUid: string,
    newTagString: string,
    user: User
}) => {
    const pageToUpdate = await fetchPage(props.pageUid)
    await isSiteOwner(pageToUpdate.siteUid, props.user.uid)

    const newMetaTag: MetaTag = {
        uid: createUid(),
        tagString: props.newTagString,
        tagCreatedIso: new Date().toISOString()
    }

    const updatedUserMetaTags = [
        ...pageToUpdate.userMetaTags,
        newMetaTag
    ]

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
