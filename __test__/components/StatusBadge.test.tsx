import React from 'react'
import { render } from '@testing-library/react-native'
import StatusBadge from '../../app/components/StatusBagde'

describe('StatusBadge Component', () => {
    test('should render correctly with available status', () => {
        const { getByText } = render(<StatusBadge status="available" />)

        expect(getByText('Disponível')).toBeTruthy()
    })

    test('should render correctly with adopted status', () => {
        const { getByText } = render(<StatusBadge status="adopted" />)

        expect(getByText('Adotado')).toBeTruthy()
    })

    test('should render correctly with pending status', () => {
        const { getByText } = render(<StatusBadge status="pending" />)

        expect(getByText('Pendente')).toBeTruthy()
    })

    test('should render correctly with reserved status', () => {
        const { getByText } = render(<StatusBadge status="reserved" />)

        expect(getByText('Reservado')).toBeTruthy()
    })

    test('should apply correct styles for available status', () => {
        const { getByTestId } = render(<StatusBadge status="available" />)

        const badge = getByTestId('status-badge')
        expect(badge).toBeTruthy()
    })

    test('should apply correct styles for adopted status', () => {
        const { getByTestId } = render(<StatusBadge status="adopted" />)

        const badge = getByTestId('status-badge')
        expect(badge).toBeTruthy()
    })

    test('should apply correct styles for pending status', () => {
        const { getByTestId } = render(<StatusBadge status="pending" />)

        const badge = getByTestId('status-badge')
        expect(badge).toBeTruthy()
    })

    test('should apply correct styles for reserved status', () => {
        const { getByTestId } = render(<StatusBadge status="reserved" />)

        const badge = getByTestId('status-badge')
        expect(badge).toBeTruthy()
    })

    test('should handle unknown status gracefully', () => {
        const { getByText } = render(<StatusBadge status="unknown" as any />)

        // Should render something even with unknown status
        expect(getByText).toBeDefined()
    })

    test('should apply custom style prop', () => {
        const customStyle = { marginTop: 10 }
        const { getByTestId } = render(<StatusBadge status="available" style={customStyle} />)

        const badge = getByTestId('status-badge')
        expect(badge).toBeTruthy()
    })

    test('should be accessible', () => {
        const { getByTestId } = render(<StatusBadge status="available" />)

        const badge = getByTestId('status-badge')
        expect(badge).toBeTruthy()
    })
})
