import React from "react";

class Home extends  React.Component { 
    constructor(props) { 
        super(props);
        this.props = props;     
      
    }
    render() { 
        

    return <div>
                <h1>Homepage</h1>        
                <div className="categories-list"></div>
            </div>        
   
    }
}

export default Home;
