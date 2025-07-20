// src/components/common/Spinner.tsx

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

const Spinner = ({ size = 'md' }: SpinnerProps) => {
    const sizeClasses = {
        sm: 'h-6 w-6 border-2',
        md: 'h-12 w-12 border-4',
        lg: 'h-16 w-16 border-4',
    };
    return (
        <div
        className={`inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] text-[var(--primary-accent)] motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClasses[size]}`}
        role="status"
        >
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
        </span>
        </div>
    );
};

export default Spinner;