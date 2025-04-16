import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

export default function Profile() {

    return (
        <div className="page-container">
            <Navbar />
            <div className="main-content">
                <Sidebar />
                <div className="content-area profile-page">
                    {/* Остальной JSX остаётся таким же */}
                    {/* ... */}
                </div>
            </div>
        </div>
    );
}