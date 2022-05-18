

export default function Loader({ msg, task }) {
    return (
        <div className="loader">
            <div className="loading">
                {task !== ''?<p>{task} ...</p> : ''}
                <p>{msg}</p>
                <span></span>
            </div>
        </div>
    )
}
