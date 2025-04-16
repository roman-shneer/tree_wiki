import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout.jsx';

function About(props) {     
    return <div className="py-12">
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <p style={{ padding: '1em', whiteSpace:'pre' }}>{props.about_text}</p>            
            <p style={{ padding: '1em' }}>Contact me <a href={props.about_link} style={{ color: 'blue', 'textDecoration': 'underline' }}><img src="/storage/images/telegram.png" style={{ width: '20px', display: 'inline' }} /></a></p>
        </div>
    </div>
</div>;
}

About.layout = (page) => {
 
    if (page.props.auth.user != null) {
        return (<AuthenticatedLayout children={page} user={page.props.user} suggestedCount={page.props.suggestedCount}></AuthenticatedLayout>)
    } else {
        return <GuestLayout children={page} ></GuestLayout>
    }
}


export default About;
