import { ObservableComponent } from "../../../../../../../../global/Tools/ObservableComponent";
import { BaseFileTree } from "../../../../../../../../global/Component/BaseFileTree/BaseFileTree";

/**
 * 文件目录树
 */
export class FileTree extends ObservableComponent {

}

export class FileTreeInner extends BaseFileTree {

    protected _props(parentProps: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
        return parentProps;
    }

    protected _onOpenItem(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 500);
        });
    }

}