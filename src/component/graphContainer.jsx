import React, {useState} from "react";
import '../styles/layout.css'; // Importing the CSS file

function GraphContainer({ title, subtitle,description, isloading, children, fullWidth=false}) {

    console.log("children: ", children);

    const [isExpanded, setIsExpanded] = useState(false);

    const handleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`graph-container ${isExpanded ? 'expanded' : ''} ${fullWidth ? 'full' : ''}`}>
            {!isloading && (
            <>
            <h3>{title}</h3>
            {/* <h3>{subtitle}</h3> */}
            <p>{description}</p>
            </>
        )}
            <div className={`centered_item ${!isloading ? "border_section" : ""}`}>
                {children[0]}
            </div>

            <div className={`text-content`}>
                {children[1]}
            </div>
        </div>    
    )

}

export default GraphContainer;