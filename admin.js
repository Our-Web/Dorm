        // --- IMPORTS & CONFIG ---
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
        import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
        import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyAY35HihNbRW1vcBhmOY7qv-Dh1GUY3f8Y",
            authDomain: "ovpfa-fad.firebaseapp.com",
            projectId: "ovpfa-fad",
            storageBucket: "ovpfa-fad.firebasestorage.app",
            messagingSenderId: "494485382397",
            appId: "1:494485382397:web:14e6eb9e8a0fc7eb144a94",
            measurementId: "G-LQM87WX605"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        const { useState, useEffect, useMemo } = React;

        // --- COMPONENTS ---

        // 1. Toast Notification
        const Toast = ({ message, type, onClose }) => {
            useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, []);
            const bgColors = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' };
            return (
                <div className={`fixed top-5 right-5 z-[100] ${bgColors[type] || 'bg-gray-800'} text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-slide print:hidden`}>
                    <i className={`fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`}></i>
                    <span className="font-medium">{message}</span>
                </div>
            );
        };

        // 2. Sidebar
        const Sidebar = ({ view, setView, selectedDorm, setSelectedDorm }) => (
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20 flex-shrink-0 relative font-sans print:hidden">
                <div className="h-20 flex items-center px-6 bg-slate-950/50 backdrop-blur-md border-b border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <i className="fas fa-university text-white text-sm"></i>
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white tracking-wide">DORM ADMIN</h1>
                            <p className="text-[10px] text-slate-500 font-medium tracking-wider">MANAGEMENT CONSOLE</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 px-3 py-6 overflow-y-auto custom-scrollbar space-y-6">
                    <div>
                        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Overview</p>
                        <div className="space-y-1">
                            <MenuItem icon="fa-chart-pie" label="Dashboard" active={view === 'DASHBOARD' && !selectedDorm} onClick={() => { setView('DASHBOARD'); setSelectedDorm(null); }} />
                            <MenuItem icon="fa-users" label="Applicants" active={view === 'APPLICANTS'} onClick={() => { setView('APPLICANTS'); setSelectedDorm(null); }} />
                            <MenuItem icon="fa-box-open" label="Inventory" active={view === 'INVENTORY'} onClick={() => { setView('INVENTORY'); setSelectedDorm(null); }} />
                        </div>
                    </div>
                    <div className="px-4"><div className="h-px bg-slate-800/60"></div></div>
                    <div>
                        <div className="flex justify-between items-center px-4 mb-3">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dormitories</p>
                            <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded">4</span>
                        </div>
                        <div className="space-y-1">
                            {['Male Dorm', 'Female Dorm', 'Foreign Dorm', 'Angat Buhay Dorm'].map(dorm => (
                                <MenuItem key={dorm} icon={dorm.includes('Male') ? "fa-male" : dorm.includes('Female') ? "fa-female" : "fa-globe"} label={dorm} onClick={() => setSelectedDorm(dorm)} active={selectedDorm === dorm} />
                            ))}
                        </div>
                    </div>
                </nav>
            </aside>
        );

        const MenuItem = ({ icon, label, active, onClick }) => (
            <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium border border-transparent ${active ? 'bg-blue-600/10 border-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' }`} >
                <i className={`fas ${icon} w-5 ${active ? 'text-blue-400' : 'text-slate-500'}`}></i>
                <span>{label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>}
            </button>
        );

        // 3. Stat Card
        const StatCard = ({ title, count, color, bg, icon }) => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all transform hover:-translate-y-1 break-inside-avoid">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
                        <p className="text-3xl font-extrabold mt-2 text-slate-800">{count}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-xl ${bg} ${color} flex items-center justify-center text-xl shadow-inner`}>
                        <i className={`fas ${icon}`}></i>
                    </div>
                </div>
            </div>
        );

        // 4. New Applicant Modal
        const NewApplicantModal = ({ onClose, onAdd }) => {
            const [formData, setFormData] = useState({
                name: '', studentId: '', dorm: 'Male Dorm', status: 'Pending', email: ''
            });

            const handleSubmit = (e) => {
                e.preventDefault();
                onAdd(formData);
            };

            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-fade">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">New Applicant</h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Full Name</label>
                                <input required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none uppercase" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value.toUpperCase()})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Student ID</label>
                                <input required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none uppercase" value={formData.studentId} onChange={e=>setFormData({...formData, studentId: e.target.value.toUpperCase()})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Dorm Preference</label>
                                <select className="w-full border p-2 rounded" value={formData.dorm} onChange={e=>setFormData({...formData, dorm: e.target.value})}>
                                    <option value="Male Dorm">Male Dorm</option>
                                    <option value="Female Dorm">Female Dorm</option>
                                    <option value="Foreign Dorm">Foreign Dorm</option>
                                    <option value="Angat Buhay Dorm">Angat Buhay Dorm</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">Create Record</button>
                        </form>
                    </div>
                </div>
            )
        }

        // 5. Inventory Modal
        const InventoryModal = ({ onClose, onAdd }) => {
             const [formData, setFormData] = useState({ item: '', quantity: 1, condition: 'Good', location: 'Storage' });
             return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-fade">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Add Inventory Item</h3>
                        <form onSubmit={(e) => { e.preventDefault(); onAdd(formData); }} className="space-y-4">
                            <input placeholder="Item Name (e.g., Bed Frame)" required className="w-full border p-2 rounded uppercase" value={formData.item} onChange={e=>setFormData({...formData, item: e.target.value.toUpperCase()})} />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" min="1" placeholder="Qty" required className="w-full border p-2 rounded" value={formData.quantity} onChange={e=>setFormData({...formData, quantity: parseInt(e.target.value)})} />
                                <select className="w-full border p-2 rounded" value={formData.condition} onChange={e=>setFormData({...formData, condition: e.target.value})}>
                                    <option value="Good">Good</option>
                                    <option value="Damaged">Damaged</option>
                                    <option value="Repair">For Repair</option>
                                </select>
                            </div>
                             <input placeholder="Location" className="w-full border p-2 rounded uppercase" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value.toUpperCase()})} />
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">Add Item</button>
                            </div>
                        </form>
                    </div>
                </div>
             )
        }

        // 6. Student Detail Modal
        const StudentModal = ({ student, onClose, onUpdate, onDelete }) => {
            const [isEditing, setIsEditing] = useState(false);
            const [formData, setFormData] = useState({ ...student });
            const handleSave = () => { onUpdate(student.id, formData); setIsEditing(false); };

            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-fade print:hidden">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="bg-slate-900 text-white p-6 flex justify-between items-center shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                                    {(formData.name || "U").charAt(0)}
                                </div>
                                <div>
                                    {isEditing ? ( <input type="text" className="text-black px-2 py-1 rounded w-64 uppercase" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })} /> ) : ( <h2 className="text-2xl font-bold">{formData.name}</h2> )}
                                    <p className="opacity-80 text-sm">ID: {formData.studentId || "N/A"}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {!isEditing ? (
                                    <>
                                        <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition">Edit</button>
                                        <button onClick={() => { if (confirm('Delete record?')) onDelete(student.id); }} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition">Delete</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handleSave} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition">Save</button>
                                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm transition">Cancel</button>
                                    </>
                                )}
                                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"><i className="fas fa-times"></i></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Dormitory</p>
                                    {isEditing ? (
                                        <select className="w-full border p-1 rounded" value={formData.dorm} onChange={e => setFormData({ ...formData, dorm: e.target.value })}>
                                            <option value="Male Dorm">Male Dorm</option>
                                            <option value="Female Dorm">Female Dorm</option>
                                            <option value="Foreign Dorm">Foreign Dorm</option>
                                            <option value="Angat Buhay Dorm">Angat Buhay Dorm</option>
                                        </select>
                                    ) : ( <p className="font-bold text-lg">{formData.dorm || "Unassigned"}</p> )}
                                </div>
                                <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-purple-500">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Room No.</p>
                                    {isEditing ? ( <input type="number" className="w-full border p-1 rounded" value={formData.roomNumber} onChange={e => setFormData({ ...formData, roomNumber: e.target.value })} /> ) : ( <p className="font-bold text-lg">{formData.roomNumber || "Unassigned"}</p> )}
                                </div>
                                <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Status</p>
                                    {isEditing ? (
                                        <select className="w-full border p-1 rounded" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                            <option value="Pending">Pending</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Occupied">Occupied</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    ) : ( <p className={`font-bold text-lg ${formData.status === 'Occupied' ? 'text-green-600' : 'text-yellow-600'}`}>{formData.status || "Pending"}</p> )}
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-700 text-lg mb-4 flex items-center gap-2"><i className="fas fa-folder-open text-blue-500"></i> Contact & Emergency</h3>
                            <div className="bg-white p-6 rounded-xl border mb-6 grid grid-cols-2 gap-4">
                                <div><p className="text-xs text-gray-400">Email</p><p>{formData.APP_emailAddress || "N/A"}</p></div>
                                <div><p className="text-xs text-gray-400">Phone</p><p>{formData.RES_phone || "N/A"}</p></div>
                                <div><p className="text-xs text-gray-400">Guardian</p><p>{formData.APP_guardianName || "N/A"}</p></div>
                                <div><p className="text-xs text-gray-400">Guardian Contact</p><p>{formData.APP_guardianContact || "N/A"}</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        // --- MAIN APP ---
        function App() {
            const [view, setView] = useState('DASHBOARD');
            const [selectedDorm, setSelectedDorm] = useState(null);
            const [selectedStudent, setSelectedStudent] = useState(null);
            const [toast, setToast] = useState(null);
            
            // Modal States
            const [showAddStudent, setShowAddStudent] = useState(false);
            const [showAddInventory, setShowAddInventory] = useState(false);

            // Data State
            const [students, setStudents] = useState([]);
            const [inventory, setInventory] = useState([]);
            const [rooms, setRooms] = useState({});
            const [loading, setLoading] = useState(true);
            const [searchTerm, setSearchTerm] = useState("");

            // --- FIREBASE LISTENERS ---
            useEffect(() => {
                signInAnonymously(auth).catch((error) => showToast(error.message, 'error'));
                const unsubAuth = onAuthStateChanged(auth, (user) => {
                    if (user) {
                        // 1. Students
                        const unsubApps = onSnapshot(collection(db, 'dorm_applications'), (snapshot) => {
                            const appList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                            setStudents(appList);
                            
                            // Map rooms
                            const currentRooms = {};
                            for (let i = 1; i <= 20; i++) currentRooms[i] = 'Available';
                            appList.forEach(s => {
                                if (s.roomNumber && (s.status === 'Occupied' || s.status === 'Approved')) {
                                    currentRooms[s.roomNumber] = 'Occupied';
                                } else if (s.roomNumber && s.status === 'Reserved') {
                                    currentRooms[s.roomNumber] = 'Reserved';
                                }
                            });
                            setRooms(currentRooms);
                            setLoading(false);
                        });

                        // 2. Inventory
                        const unsubInv = onSnapshot(collection(db, 'dorm_inventory'), (snapshot) => {
                            setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                        });

                        return () => { unsubApps(); unsubInv(); };
                    }
                });
                return () => unsubAuth();
            }, []);

            // --- HANDLERS ---
            const showToast = (message, type = 'info') => { setToast({ message, type }); };

            const filteredStudents = useMemo(() => {
                if (!searchTerm) return students;
                const lower = searchTerm.toLowerCase();
                return students.filter(s => (s.name && s.name.toLowerCase().includes(lower)) || (s.studentId && s.studentId.includes(lower)));
            }, [searchTerm, students]);

            // CRUD Handlers
            const handleAddStudent = async (data) => {
                try {
                    await addDoc(collection(db, "dorm_applications"), { 
                        ...data,
                        RES_resFirstName: data.name.split(" ")[0], // Backwards compat
                        RES_resLastName: data.name.split(" ").pop(),
                        createdAt: serverTimestamp() 
                    });
                    showToast("Applicant added successfully", "success");
                    setShowAddStudent(false);
                } catch(e) { showToast(e.message, "error"); }
            };

            const handleUpdateStudent = async (id, data) => {
                try {
                    await updateDoc(doc(db, "dorm_applications", id), data);
                    showToast("Record updated", "success");
                    setSelectedStudent(prev => prev ? ({ ...prev, ...data }) : null);
                } catch (e) { showToast(e.message, "error"); }
            };

            const handleDeleteStudent = async (id) => {
                try {
                    await deleteDoc(doc(db, "dorm_applications", id));
                    showToast("Record deleted", "success");
                    setSelectedStudent(null);
                } catch (e) { showToast(e.message, "error"); }
            };

            // Inventory Handlers
            const handleAddInventory = async (data) => {
                try {
                    await addDoc(collection(db, "dorm_inventory"), { ...data, createdAt: serverTimestamp() });
                    showToast("Item added to inventory", "success");
                    setShowAddInventory(false);
                } catch(e) { showToast(e.message, "error"); }
            };

            const handleDeleteInventory = async (id) => {
                if(!confirm("Remove item from inventory?")) return;
                try {
                    await deleteDoc(doc(db, "dorm_inventory", id));
                    showToast("Item removed", "success");
                } catch(e) { showToast(e.message, "error"); }
            }

            // Room Logic
            const handleRoomClick = (roomNum, status) => {
                if (status === 'Occupied') {
                    const occupant = students.find(s => s.roomNumber == roomNum && (s.status === 'Occupied' || s.status === 'Approved'));
                    if(occupant) setSelectedStudent(occupant);
                } else {
                    showToast(`Room ${roomNum} is ${status}. Go to Applicants to assign a student here.`, "info");
                }
            };

            const handlePrint = () => {
                window.print();
            };

            if (loading) return <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50"><i className="fas fa-circle-notch fa-spin text-4xl text-blue-600 mb-4"></i><p className="text-slate-500 font-medium">Connecting to Database...</p></div>;

            return (
                <div className="flex h-screen bg-slate-50">
                    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                    <Sidebar view={view} setView={setView} selectedDorm={selectedDorm} setSelectedDorm={setSelectedDorm} />
                    
                    <main className="flex-1 flex flex-col relative overflow-hidden print-full-width">
                        
                        {/* Header */}
                        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10 print:hidden">
                            <div className="relative w-96 group">
                                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition"></i>
                                <input type="text" placeholder="Search students..." className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 border-2 rounded-lg outline-none transition-all placeholder-slate-400 font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                {searchTerm && (
                                    <div className="absolute top-full left-0 w-full bg-white shadow-xl rounded-lg mt-2 border border-slate-100 max-h-64 overflow-y-auto z-50 animate-fade">
                                        {filteredStudents.length > 0 ? filteredStudents.map(s => (
                                            <div key={s.id} onClick={() => { setSelectedStudent(s); setSearchTerm(''); }} className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center group">
                                                <div><p className="font-bold text-slate-800">{s.name || s.RES_resFirstName}</p><p className="text-xs text-slate-500">{s.studentId}</p></div>
                                                <i className="fas fa-chevron-right text-slate-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition"></i>
                                            </div>
                                        )) : <div className="p-4 text-center text-slate-400 text-sm">No matches found.</div>}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-500 transition relative"><i className="fas fa-bell"></i></button>
                                <div className="text-right hidden md:block"><p className="text-sm font-bold text-slate-800">Admin User</p><p className="text-xs text-slate-500">OVPFA FAD</p></div>
                                <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-slate-200 cursor-pointer hover:ring-blue-400 transition">AD</div>
                            </div>
                        </header>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar print:p-0">
                            
                            {/* DASHBOARD */}
                            {!selectedDorm && view === 'DASHBOARD' && (
                                <div className="animate-fade max-w-7xl mx-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-slate-800">System Overview</h2>
                                        <button onClick={handlePrint} className="print:hidden bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700"><i className="fas fa-print mr-2"></i>Print Report</button>
                                    </div>

                                    

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 print:grid-cols-2">
                                        <StatCard title="Pending Review" count={students.filter(s => s.status === 'Pending').length} color="text-yellow-600" bg="bg-yellow-50" icon="fa-clock" />
                                        <StatCard title="Occupied Rooms" count={Object.values(rooms).filter(r => r === 'Occupied').length} color="text-indigo-600" bg="bg-indigo-50" icon="fa-bed" />
                                        <StatCard title="Available Slots" count={Object.values(rooms).filter(r => r === 'Available').length} color="text-emerald-600" bg="bg-emerald-50" icon="fa-door-open" />
                                        <StatCard title="Total Students" count={students.length} color="text-blue-600" bg="bg-blue-50" icon="fa-database" />
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl shadow-sm border print:border-none print:shadow-none">
                                        <h3 className="font-bold mb-4">Quick Actions (No-Print)</h3>
                                        <div className="flex gap-4 no-print">
                                            <button onClick={() => setView('APPLICANTS')} className="flex-1 py-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition flex flex-col items-center justify-center gap-2">
                                                <i className="fas fa-user-plus text-2xl"></i><span className="font-bold text-sm">Review Applications</span>
                                            </button>
                                            <button onClick={() => setView('INVENTORY')} className="flex-1 py-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 text-slate-500 hover:text-purple-600 transition flex flex-col items-center justify-center gap-2">
                                                <i className="fas fa-boxes text-2xl"></i><span className="font-bold text-sm">Manage Inventory</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* APPLICANTS TABLE */}
                            {view === 'APPLICANTS' && (
                                <div className="animate-fade max-w-7xl mx-auto space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                                        <div><h2 className="text-2xl font-bold text-slate-800">Applications</h2><p className="text-slate-500 text-sm">Manage student housing requests</p></div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setShowAddStudent(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition text-sm font-bold flex items-center gap-2">
                                                <i className="fas fa-plus"></i> <span className="hidden sm:inline">Add Student</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-none">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs tracking-wider">
                                                        <th className="p-4 font-bold">Student Name</th>
                                                        <th className="p-4 font-bold">Dormitory</th>
                                                        <th className="p-4 font-bold">Room</th>
                                                        <th className="p-4 font-bold">Status</th>
                                                        <th className="p-4 font-bold text-right no-print">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {students.map(s => (
                                                        <tr key={s.id} className="hover:bg-blue-50/50 transition duration-150 group">
                                                            <td className="p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ${s.status === 'Approved' ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-slate-400 to-slate-500' }`}>{(s.name || s.RES_resFirstName || "?").charAt(0)}</div>
                                                                    <div><div className="font-bold text-slate-800 uppercase">{s.name || `${s.RES_resFirstName} ${s.RES_resLastName}`}</div><div className="text-xs text-slate-500 font-mono">{s.studentId || s.APP_studentId}</div></div>
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-sm text-slate-600">{s.dorm || s.RES_dormPreference}</td>
                                                            <td className="p-4">{s.roomNumber ? <span className="font-bold text-slate-700">RM {s.roomNumber}</span> : <span className="text-slate-300">-</span>}</td>
                                                            <td className="p-4"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${s.status?.includes('Pending') ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200'}`}>{s.status}</span></td>
                                                            <td className="p-4 text-right no-print">
                                                                <button onClick={() => setSelectedStudent(s)} className="text-blue-500 hover:bg-blue-100 p-2 rounded"><i className="fas fa-edit"></i></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* INVENTORY VIEW */}
                            {view === 'INVENTORY' && (
                                <div className="animate-fade max-w-7xl mx-auto space-y-6">
                                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                                        <div><h2 className="text-2xl font-bold text-slate-800">Inventory</h2><p className="text-slate-500 text-sm">Track furniture and assets</p></div>
                                        <button onClick={() => setShowAddInventory(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 shadow-lg transition text-sm font-bold"><i className="fas fa-plus mr-2"></i>Add Item</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {inventory.map(item => (
                                            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-lg text-slate-800 uppercase">{item.item}</h4>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.condition === 'Good' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.condition}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 mt-1"><i className="fas fa-map-marker-alt mr-1"></i> {item.location}</p>
                                                </div>
                                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                                                    <span className="font-bold text-2xl text-slate-700">{item.quantity} <span className="text-xs font-normal text-slate-400">pcs</span></span>
                                                    <button onClick={()=>handleDeleteInventory(item.id)} className="text-red-400 hover:text-red-600 no-print"><i className="fas fa-trash-alt"></i></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {inventory.length === 0 && <div className="text-center py-10 text-slate-400">No items in inventory.</div>}
                                </div>
                            )}

                            {/* DORM LAYOUT VIEW */}
                            {selectedDorm && (
                                <div className="animate-fade max-w-7xl mx-auto">
                                    <div className="flex items-center gap-4 mb-6 no-print">
                                        <button onClick={() => setSelectedDorm(null)} className="h-10 w-10 rounded-full border bg-white hover:bg-slate-50 flex items-center justify-center transition shadow-sm text-slate-600"><i className="fas fa-arrow-left"></i></button>
                                        <div><h2 className="text-2xl font-bold text-slate-800">{selectedDorm}</h2><p className="text-sm text-slate-500">Live Availability Map</p></div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {Object.entries(rooms).map(([roomNum, status]) => (
                                            <div key={roomNum} onClick={() => handleRoomClick(parseInt(roomNum), status)} className={`h-32 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition relative group shadow-sm ${status === 'Occupied' ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:-translate-y-1"}`}>
                                                <span className="text-3xl font-bold">{roomNum}</span>
                                                <span className="text-[10px] uppercase font-bold tracking-wider mt-1 bg-white/60 px-2 py-0.5 rounded-full">{status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </main>

                    {/* MODALS */}
                    {selectedStudent && <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} onUpdate={handleUpdateStudent} onDelete={handleDeleteStudent} />}
                    {showAddStudent && <NewApplicantModal onClose={()=>setShowAddStudent(false)} onAdd={handleAddStudent} />}
                    {showAddInventory && <InventoryModal onClose={()=>setShowAddInventory(false)} onAdd={handleAddInventory} />}
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);