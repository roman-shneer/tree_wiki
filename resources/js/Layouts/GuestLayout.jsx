import { Link } from '@inertiajs/react';
import NavLink from '@/components/NavLink';
export default function Guest({ children }) {
    
    const title = children.props.app_name + " Home";
    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <table className='header'>
                        <tbody>
                            <tr>
                                <td>
                                    <Link href="/">
                                        <img src="/storage/images/logo.png" alt={children.props.app_name} className="block h-9 w-auto fill-current text-gray-800" style={{ height: '60px', width: '60px' }} title={title} />
                                    </Link>
                                </td>
                                <td>
                                    <NavLink href={route('about')} active={route().current('about')} className="header-btn">
                                        About
                                    </NavLink>
                                </td>                               
                                <td>
                                    <h1>{children.props.app_description}</h1>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    {Ziggy.routes.login && <NavLink href={route('login')} active={route().current('login')} className="header-btn" style={{position:'absolute', right:0}}>
                                        Login
                                    </NavLink>}
                </div>


            </nav>


            <main>{children}</main>
        </div>
    );
}
