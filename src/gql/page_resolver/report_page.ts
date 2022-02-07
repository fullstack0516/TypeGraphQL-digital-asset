import { fetchPage } from "./fetch_page";
import { createUid } from "../../helpers/helpers";
import { ApolloError } from "apollo-server-errors";
import { updatePage } from "./update_page";
import { updateUser } from "../user_resolver/update_user";
import { PageModel } from "../../models/page_model";
import { Report, ReportModel } from "../../models/report";

export const reportPage = async (pageUid: string, userUid: string, reasonDesc: string) => {
    // Check page exists.
    await fetchPage(pageUid)

    const report: Report = {
        uid: createUid(),
        createdIso: new Date().toISOString(),
        pageUid,
        userUid,
        reasonDesc,
    }

    const existingReport = await ReportModel.find({ pageUid: report.pageUid, userUid: report.userUid });
    if (existingReport.length > 0) {
        throw new ApolloError('already-reported', 'The user has already reported this page.')
    }

    await PageModel.updateOne(
        { uid: pageUid }, {
        $inc: {
            numberOfReports: 1,
        }
    })

    // Number of total views vs auto-flag.
    const page = await fetchPage(pageUid)
    if (page.totalVisits > 10) {
        // 3% is auto-flag.
        const percentageReported = page.numberOfReports / page.totalVisits;
        if (percentageReported > 0.03) {
            await updatePage(pageUid, { isFlagged: true })
            await updateUser(userUid, { isFlagged: true })
        }
    }

    await ReportModel.create(report)
}
