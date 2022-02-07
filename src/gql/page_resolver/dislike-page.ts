
import { fetchPage } from "./fetch_page"
import { PageLike, PageLikeModel } from "../../models/page_like"
import { createUid } from "../../helpers/helpers"
import { PageModel } from "../../models/page_model"

export const dislikePage = async (pageUid: string, userUid: string) => {
    // Check page exists.
    await fetchPage(pageUid)
    // check user voted before
    const existingLike = await PageLikeModel.findOne({ pageUid: pageUid, userUid: userUid }).exec()

    const newLike: PageLike = {
        uid: createUid(),
        createdIso: new Date().toISOString(),
        pageUid,
        userUid,
        liked: existingLike?.liked === -1 ? 0 : -1
    }

    if (existingLike) {
        // @ts-ignore
        delete newLike.uid;
        // update the liked
        await PageLikeModel.updateOne(
            { uid: existingLike.uid },
            {
                $set: newLike
            }
        ).exec()
        // update the likes, dislikes of page according to the value of old and new liked
        await PageModel.updateOne(
            { uid: pageUid },
            {
                $inc: {
                    likes: existingLike.liked === 1 ? -1 : 0,
                    dislikes: existingLike.liked === -1 ? -1 : 1,
                },
            }
        ).exec()

        return;
    }

    // create the new liked
    await PageLikeModel.create(newLike)
    // increase the likes of page
    await PageModel.updateOne(
        { uid: pageUid }, {
        $inc: {
            dislikes: 1,
        }
    }).exec()
}
