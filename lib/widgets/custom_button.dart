import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final Color? txtColor;
  final Color? backgroundColor;
  final IconData? icon;
  final Color? iconColor;
  final double? iconSize;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final VoidCallback onPressed;

  const CustomButton({
    super.key,
    required this.text,
    this.txtColor,
    this.backgroundColor,
    this.icon,
    this.iconColor,
    this.iconSize,
    required this.borderRadius,
    required this.padding,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveBgColor = backgroundColor ?? Colors.white;
    final effectiveTxtColor = txtColor ?? Colors.black;

    final content = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        if (icon != null) ...[
          Icon(
            icon,
            color: iconColor ?? effectiveTxtColor,
            size: iconSize ?? 18,
          ),
          const SizedBox(width: 8),
        ],
        Text(
          text,
          style: TextStyle(
            color: effectiveTxtColor,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );

    return OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        backgroundColor: effectiveBgColor,
        padding: padding,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
        side: BorderSide.none,
      ),
      child: content,
    );
  }
}
