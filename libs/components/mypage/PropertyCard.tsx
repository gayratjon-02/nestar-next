import React, { useState } from 'react';
import { Menu, MenuItem, Stack, Typography, IconButton } from '@mui/material';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import Moment from 'react-moment';
import { useRouter } from 'next/router';

import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Property } from '../../types/property/property';
import { formatterStr } from '../../utils';
import { PropertyStatus } from '../../enums/property.enum';

interface PropertyCardProps {
	property: Property;
	deletePropertyHandler?: (id: string) => void;
	updatePropertyHandler?: (status: PropertyStatus, id: string) => void;
	memberPage?: boolean;
}

export const PropertyCard = (props: PropertyCardProps) => {
	const { property, deletePropertyHandler, updatePropertyHandler, memberPage } = props;

	const device = useDeviceDetect();
	const router = useRouter();

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	/* ===================== HANDLERS ===================== */

	const pushEditProperty = async (id: string) => {
		await router.push({
			pathname: '/mypage',
			query: { category: 'addProperty', propertyId: id },
		});
	};

	const pushPropertyDetail = async (id: string) => {
		if (!memberPage) return;

		await router.push({
			pathname: '/property/detail',
			query: { id },
		});
	};

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	/* ===================== MOBILE ===================== */

	if (device === 'mobile') {
		return <div>MOBILE PROPERTY CARD</div>;
	}

	/* ===================== DESKTOP ===================== */

	return (
		<Stack className="property-card-box">
			{/* IMAGE */}
			<Stack className="image-box" onClick={() => pushPropertyDetail(property._id)}>
				<img src={`${process.env.REACT_APP_API_URL}/${property.propertyImages?.[0]}`} alt={property.propertyTitle} />
			</Stack>

			{/* INFO */}
			<Stack className="information-box" onClick={() => pushPropertyDetail(property._id)}>
				<Typography className="name">{property.propertyTitle}</Typography>
				<Typography className="address">{property.propertyAddress}</Typography>
				<Typography className="price">
					<strong>${formatterStr(property.propertyPrice)}</strong>
				</Typography>
			</Stack>

			{/* DATE */}
			<Stack className="date-box">
				<Typography className="date">
					<Moment format="DD MMMM, YYYY">{property.createdAt}</Moment>
				</Typography>
			</Stack>

			{/* STATUS */}
			<Stack className="status-box">
				<Stack className="coloured-box" sx={{ background: '#E5F0FD' }} onClick={handleMenuOpen}>
					<Typography className="status" sx={{ color: '#3554d1' }}>
						{property.propertyStatus}
					</Typography>
				</Stack>
			</Stack>

			{/* STATUS MENU */}
			{!memberPage && property.propertyStatus !== PropertyStatus.SOLD && (
				<Menu
					anchorEl={anchorEl}
					open={open}
					onClose={handleMenuClose}
					PaperProps={{
						elevation: 0,
						sx: {
							width: 80,
							mt: 1,
							ml: 1,
							filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
						},
					}}
				>
					{property.propertyStatus === PropertyStatus.ACTIVE && (
						<MenuItem
							onClick={() => {
								handleMenuClose();
								updatePropertyHandler?.(PropertyStatus.SOLD, property._id);
							}}
						>
							Sold
						</MenuItem>
					)}
				</Menu>
			)}

			{/* VIEWS */}
			<Stack className="views-box">
				<Typography className="views">{property.propertyViews.toLocaleString()}</Typography>
			</Stack>

			{/* ACTION BUTTONS */}
			{!memberPage && property.propertyStatus === PropertyStatus.ACTIVE && (
				<Stack className="action-box">
					<IconButton className="icon-button" onClick={() => pushEditProperty(property._id)}>
						<ModeIcon className="buttons" />
					</IconButton>

					<IconButton className="icon-button" onClick={() => deletePropertyHandler?.(property._id)}>
						<DeleteIcon className="buttons" />
					</IconButton>
				</Stack>
			)}
		</Stack>
	);
};
