import type { Scene } from "core/scene";
import type { Nullable } from "core/types";
import { useState, useEffect } from "react";
import type { FC } from "react";
import { CommandBarComponent } from "shared-ui-components/components/bars/CommandBarComponent";
import { FlexibleGridLayout } from "shared-ui-components/components/layout/FlexibleGridLayout";
import { SceneContext } from "./SceneContext";
import style from "./workbench.modules.scss";
import type { GraphNode } from "shared-ui-components/nodeGraphSystem/graphNode";
import { SelectionContext } from "./components/SelectionContext";
import { initialLayout } from "./initialLayout";
import { Vector3 } from "core/Maths/math";
import { SetPositionAction } from "./actions/actions/SetPositionAction";
import { StateMachine } from "./stateMachine/StateMachine";
// @ts-ignore
import { LogAction } from "./actions/actions/LogAction";
import { StateMachineContext } from "./StateMachineContext";

export type WorkbenchProps = {};

// eslint-disable-next-line @typescript-eslint/naming-convention
const INITIAL_WORKBENCH_COLOR = "#AAAAAA";

export const Workbench: FC<WorkbenchProps> = () => {
    const [workAreaColor, setWorkAreaColor] = useState(INITIAL_WORKBENCH_COLOR);
    const [scene, setScene] = useState<Nullable<Scene>>(null);
    const [selectedNode, setSelectedNode] = useState<Nullable<GraphNode>>(null);
    const [stateMachine, setStateMachine] = useState<Nullable<StateMachine>>(null);

    useEffect(() => {
        if (scene) {
            const node = scene.getMeshByName("sphere");
            if (node) {
                const stateMachine = new StateMachine(scene, node);

                stateMachine.setStartingState("Sphere Origin");
                stateMachine.addTransition("Sphere Origin", "Sphere Destination");
                stateMachine.addTransition("Sphere Destination", "Sphere Origin");

                const setPositionOriginAction = new SetPositionAction();
                setPositionOriginAction.targetNode = node;
                setPositionOriginAction.targetPosition = new Vector3(0, 0, 0);
                stateMachine.setStateEnterAction("Sphere Origin", setPositionOriginAction);

                const setPositionDestinationAction = new SetPositionAction();
                setPositionDestinationAction.targetNode = node;
                setPositionDestinationAction.targetPosition = new Vector3(1, 1, 1);
                stateMachine.setStateEnterAction("Sphere Destination", setPositionDestinationAction);

                stateMachine.start();

                setStateMachine(stateMachine);
            }
        }
    }, [scene]);

    return (
        <SceneContext.Provider value={{ scene, setScene }}>
            <StateMachineContext.Provider value={{ stateMachine, setStateMachine }}>
                <SelectionContext.Provider value={{ selectedNode, setSelectedNode }}>
                    <div className={style.workbenchContainer}>
                        <CommandBarComponent
                            artboardColor={workAreaColor}
                            artboardColorPickerColor={INITIAL_WORKBENCH_COLOR}
                            onArtboardColorChanged={(newColor) => setWorkAreaColor(newColor)}
                        />
                        <div className={style.workArea} style={{ backgroundColor: workAreaColor }}>
                            <FlexibleGridLayout layoutDefinition={initialLayout} />
                        </div>
                    </div>
                </SelectionContext.Provider>
            </StateMachineContext.Provider>
        </SceneContext.Provider>
    );
};
