import AppLayout from '@/layouts/app-layout';
import { Commet } from 'react-loading-indicators';
const Loading = ({ height = '100vh' }) => {
    return (
        <AppLayout>
            <div
                style={{ height }}
                className="flex h-screen items-center justify-center"
            >
                <Commet
                    color="#3191cc"
                    size="medium"
                    text=""
                    textColor="#NaNNaNNaN"
                />
            </div>
        </AppLayout>
    );
};

export default Loading;
