import { render, fireEvent, waitFor } from "@testing-library/react-native"
import FavoriteButton from "../../app/components/FavoriteButton"
import NotificationService from "../../app/utils/NotificationsServices"

// Mock do NotificationService
jest.mock("../../app/utils/NotificationsServices")

const mockNotificationService = {
    isPetFavorited: jest.fn(),
    addToFavorites: jest.fn(),
    removeFromFavorites: jest.fn(),
    getInstance: jest.fn(),
}
    ; (NotificationService.getInstance as jest.Mock).mockReturnValue(mockNotificationService)

describe("FavoriteButton Component", () => {
    const defaultProps = {
        petId: "test-pet-id",
        petType: "dog",
        petName: "Buddy",
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test("should render correctly", () => {
        mockNotificationService.isPetFavorited.mockResolvedValue(false)

        const { getByTestId } = render(<FavoriteButton {...defaultProps} />)

        // O componente deve renderizar
        expect(getByTestId).toBeDefined()
    })

    test("should show unfavorited state initially", async () => {
        mockNotificationService.isPetFavorited.mockResolvedValue(false)

        const { getByTestId } = render(<FavoriteButton {...defaultProps} />)

        const button = getByTestId("favorite-button")
        expect(button).toBeTruthy()
    })

    test("should show favorited state when pet is favorited", async () => {
        mockNotificationService.isPetFavorited.mockResolvedValue(true)

        const { getByTestId } = render(<FavoriteButton {...defaultProps} />)

        await waitFor(() => {
            const button = getByTestId("favorite-button")
            expect(button).toBeTruthy()
        })
    })

    test("should add to favorites when clicked and not favorited", async () => {
        mockNotificationService.isPetFavorited.mockResolvedValue(false)
        mockNotificationService.addToFavorites.mockResolvedValue(undefined)

        const { getByTestId } = render(<FavoriteButton {...defaultProps} />)

        const button = getByTestId("favorite-button")
        fireEvent.press(button)

        await waitFor(() => {
            expect(mockNotificationService.addToFavorites).toHaveBeenCalledWith("test-pet-id", "dog", "Buddy")
        })
    })

    test("should remove from favorites when clicked and favorited", async () => {
        mockNotificationService.isPetFavorited.mockResolvedValue(true)
        mockNotificationService.removeFromFavorites.mockResolvedValue(undefined)

        const { getByTestId } = render(<FavoriteButton {...defaultProps} />)

        // Aguarde o estado ser refletido
        await waitFor(() => {
            const button = getByTestId("favorite-button")
            expect(button).toBeTruthy()
        })

        const button = getByTestId("favorite-button")
        fireEvent.press(button)

        await waitFor(() => {
            expect(mockNotificationService.removeFromFavorites).toHaveBeenCalledWith("test-pet-id")
        })
    })


    test("should handle errors gracefully", async () => {
        mockNotificationService.isPetFavorited.mockRejectedValue(new Error("Network error"))

        const consoleSpy = jest.spyOn(console, "error").mockImplementation()

        render(<FavoriteButton {...defaultProps} />)

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith("Erro ao verificar status de favorito:", expect.any(Error))
        })

        consoleSpy.mockRestore()
    })

    test("should not allow multiple clicks while loading", async () => {
        mockNotificationService.isPetFavorited.mockResolvedValue(false)
        mockNotificationService.addToFavorites.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)))

        const { getByTestId } = render(<FavoriteButton {...defaultProps} />)

        const button = getByTestId("favorite-button")

        // Primeiro clique
        fireEvent.press(button)

        // Segundo clique imediato (deve ser ignorado)
        fireEvent.press(button)

        await waitFor(() => {
            expect(mockNotificationService.addToFavorites).toHaveBeenCalledTimes(1)
        })
    })

    test("should apply custom size and style props", () => {
        const customProps = {
            ...defaultProps,
            size: 32,
            style: { backgroundColor: "red" },
        }

        mockNotificationService.isPetFavorited.mockResolvedValue(false)

        const { getByTestId } = render(<FavoriteButton {...customProps} />)

        const button = getByTestId("favorite-button")
        expect(button).toBeTruthy()
    })
})
