import React from "react";
import '../styles/layout.css'; // Importing the CSS file

function GraphContainer({ title, subtitle, isloading, children }) {

    return (
        <div className="graph-container">
            {!isloading && (
            <>
            <h2>{title}</h2>
            <h3>{subtitle}</h3>
            </>
            )}
            <div className="centered_item">
                {children}
            </div>
        </div>    
    )

}

export default GraphContainer;