import * as React from "react";
import * as _ from "lodash";
import {Session} from "../shell/Session";
import {Job} from "../shell/Job";
import {JobComponent} from "./3_JobComponent";
import {KeyCode} from "../Enums";
import * as css from "./css/main";

interface Props {
    session: Session;
    isFocused: boolean;
    focus: () => void;
    updateStatusBar: (() => void) | undefined; // Only the focused session can update the status bar.
}

export class SessionComponent extends React.Component<Props, {}> {
    RENDER_JOBS_COUNT = 25;

    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
        this.props.session
            .on("job", () => this.props.updateStatusBar && this.props.updateStatusBar())
            .on("vcs-data", () => this.props.updateStatusBar && this.props.updateStatusBar());
    }

    render() {
        const jobs = _.takeRight(this.props.session.jobs, this.RENDER_JOBS_COUNT).map((job: Job, index: number) =>
            <JobComponent key={job.id}
                          job={job}
                          isFocused={this.props.isFocused && index === this.props.session.jobs.length - 1}/>
        );

        return (
            <div className="session"
                 style={css.session(this.props.isFocused)}
                 tabIndex={0}
                 onClickCapture={this.handleClick.bind(this)}
                 onKeyDownCapture={this.handleKeyDown.bind(this)}>

                <div className="jobs" style={css.jobs(this.props.isFocused)}>{jobs}</div>

                <div className="shutter" style={css.sessionShutter(this.props.isFocused)}></div>
            </div>
        );
    }

    private handleClick() {
        if (!this.props.isFocused) {
            this.props.focus();
        }
    }

    private handleKeyDown(event: KeyboardEvent) {
        if (event.ctrlKey && event.keyCode === KeyCode.L) {
            this.props.session.clearJobs();

            event.stopPropagation();
            return;
        }

        // Cmd+D.
        if (event.metaKey && event.keyCode === KeyCode.D) {
            window.DEBUG = !window.DEBUG;

            require("devtron").install();

            event.stopPropagation();
            this.forceUpdate();

            console.log(`Debugging mode has been ${window.DEBUG ? "enabled" : "disabled"}.`);
            return;
        }

        // FIXME: find a better design to propagate events.
        window.focusedJob.handleKeyDown(event);
    }
}
