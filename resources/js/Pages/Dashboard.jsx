import Suggestions from '@/components/Dashboard/Suggestions';
import VisitsGraph from '@/components/Dashboard/VisitsGraph';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { apiPost } from '@/components/HelpFunctions.jsx';

export default function Dashboard(props) { 
  

    const [list, setList] = useState([]);
    useEffect(() => { 
       
        apiPost(route('api.suggestions'), {}, props.token, (result) => {
            setList(result.list);                      
        });
    }, []);
    
    return (
        <AuthenticatedLayout
            user={props.auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">You're logged in!  <a href={route('admin.images')} style={{color:'blue'}}>Images Management</a></div>                                                
                        <VisitsGraph stats={props.stats}></VisitsGraph>
                        <Suggestions list={list} token={props.token}></Suggestions>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
