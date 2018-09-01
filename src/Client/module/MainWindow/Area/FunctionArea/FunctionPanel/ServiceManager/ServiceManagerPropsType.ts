import { serviceManagerErrorNumber } from "../../../SideBar/SideBarPropsType";
import { contentWindows } from "../../../ContentWindow/ContentWindowPropsType";
import { functionAreaDisplayType } from "../../FunctionAreaPropsType";

export type ServiceManagerPropsType = {
    functionAreaDisplayType: functionAreaDisplayType,
    serviceManagerErrorNumber: serviceManagerErrorNumber,
    contentWindows: contentWindows
};