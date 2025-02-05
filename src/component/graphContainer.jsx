import React, {useState} from "react";
import '../styles/layout.css'; // Importing the CSS file

function GraphContainer({ title, subtitle,description, isloading, children }) {

    const [isExpanded, setIsExpanded] = useState(false);

    const handleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`graph-container ${isExpanded ? 'expanded' : ''}`} onClick={handleExpand}>
            {!isloading && (
            <>
            <h3>{title}</h3>
            {/* <h3>{subtitle}</h3> */}
            <p>{description}</p>
            </>
        )}
            <div className={`centered_item ${!isloading ? "border_section" : ""}`}>
                {children}
            </div>
        </div>    
    )

}

export default GraphContainer;