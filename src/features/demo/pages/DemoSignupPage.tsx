import { SignupPage } from '../../auth/pages/SignupPage';
import { DemoModeBar } from '../components/DemoModeBar';

export const DemoSignupPage = () => {
    return (
        <div data-testid="demo-signup-page">
            <SignupPage demoMode banner={<DemoModeBar step={2} compact />} />
        </div>
    );
};
