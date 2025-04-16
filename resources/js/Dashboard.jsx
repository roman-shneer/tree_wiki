import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import './../../css/style.css';
import './../../css/admin.css';
export default function Dashboard({ auth }) {
   
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div>
                            
                            <div className="adminTiles paddingLeft-10px">
                                <a href="admin/sites/">Sites</a>
                            </div>
                            <div className="adminTiles paddingLeft-10px">
                                <a href="admin/users/">Users</a>
                            </div>
                            <div className="adminTiles paddingLeft-10px">
                                <a href="admin/orders/">Orders</a>
                            </div>
                            <div className="adminTiles paddingLeft-10px">
                                <a href="admin/categories/">Categories</a>
                            </div>
                            <div className="adminTiles paddingLeft-10px">
                                <a href="admin/products/">Products</a>
                            </div>
                            <div className="adminTiles paddingLeft-10px">
                                <a href="admin/settings/">Settings</a>
                            </div>
                            <div className="adminTiles paddingLeft-10px">
                                <a href="admin/shipping/">Shipping</a>
                            </div>
                            <div className="adminTiles paddingLeft-10px">
                                <a href="admin/design/">Design</a>
                            </div>
                            <div className="adminTiles paddingLeft-10px">
                                <a href="admin/translate/">Translate</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
