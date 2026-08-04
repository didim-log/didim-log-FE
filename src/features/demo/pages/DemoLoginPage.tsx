import { LoginPage } from '../../auth/pages/LoginPage';
import { DemoModeBar } from '../components/DemoModeBar';

export const DemoLoginPage = () => {
    return (
        <div data-testid="demo-login-page">
            <LoginPage demoMode banner={<DemoModeBar step={1} compact />} />
        </div>
    );
};
